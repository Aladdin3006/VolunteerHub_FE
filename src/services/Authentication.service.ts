import { loginUser } from "../apis/login";

class AuthenticationService {
  private tokenKey = "token";
  private userKey = "user";
  private listeners: Array<() => void> = [];

  // Add event listener
  addListener(listener: () => void) {
    this.listeners.push(listener);
  }

  // Remove event listener
  removeListener(listener: () => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  // Notify all listeners
  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Login
  async login(credentials: { email: string; password: string }) {
    try {
      const data = await loginUser(credentials);
      // Store token separately AND in user object
      this.setToken(data.user.token);
      this.setUser(data.user);
      this.notify(); // Notify listeners about auth change
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Logout
  logout() {
    this.clearAuth();
    this.notify(); // Notify listeners about auth change
    window.location.href = "/login";
  }

  // Token - FIXED: Check both locations for token
  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    // First check the separate token storage
    let token = localStorage.getItem(this.tokenKey);
    
    // If not found, check if it's in the user object
    if (!token) {
      const user = this.getUser();
      token = user?.token || null;
    }
    
    return token;
  }

  // User
  setUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): any | null {
    try {
      const user = localStorage.getItem(this.userKey);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to parse user data", error);
      return null;
    }
  }

  // Auth state - FIXED: Better token validation
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    
    console.log("isAuthenticated check - token:", !!token, "user:", !!user);
    
    // Must have both token and user data
    if (!token || !user) {
      return false;
    }

    // Optional: Add token expiration check
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        const currentTime = Date.now() / 1000;
        const isValid = payload.exp > currentTime;
        console.log("Token expiration check:", isValid, "exp:", payload.exp, "now:", currentTime);
        return isValid;
      }
    } catch (error) {
      console.log("Token validation error (assuming valid):", error);
    }

    return true;
  }

  // Role handling
  getUserRole(): string | null {
    const user = this.getUser();
    console.log("User role:", user?.role);
    return user?.role || null;
  }

  // Role checking
  hasRole(requiredRole: string): boolean {
    const userRole = this.getUserRole()?.toLowerCase();
    const required = requiredRole.toLowerCase();

    console.log("Role check - User role:", userRole, "Required:", required);

    // Admin can access everything
    if (userRole === "admin") return true;

    // Manager can access manager and user areas
    if (
      userRole === "manager" &&
      (required === "manager" || required === "user")
    )
      return true;

    // Organization can access organization areas
    if (userRole === "organization" && required === "organization") return true;

    // User can access user areas
    if (userRole === "user" && required === "user") return true;

    return false;
  }

  // Get default route based on user role
  getDefaultRoute(): string {
    const userRole = this.getUserRole()?.toLowerCase();

    switch (userRole) {
      case "admin":
        return "/admin/dashboard";
      case "manager":
        return "/manager/dashboard";
      case "organization":
        return "/organization/dashboard";
      case "user":
        return "/";
      default:
        return "/";
    }
  }

  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.notify(); // Notify listeners about auth change
  }
}

const authService = new AuthenticationService();
export { AuthenticationService };
export default authService;