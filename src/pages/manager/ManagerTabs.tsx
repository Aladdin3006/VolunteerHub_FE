import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

type ManagerTabType = "campaigns" | "donations" | "storms";

interface TabItem {
    label: string;
    value: ManagerTabType;
    path?: string; // Optional navigation path
}

interface ManagerTabsProps {
    activeTab: ManagerTabType;
    onTabChange: (value: ManagerTabType) => void;
}

const ManagerTabs: React.FC<ManagerTabsProps> = ({ activeTab, onTabChange }) => {
    const navigate = useNavigate();
    const tabs: TabItem[] = [
        { label: "Quản lý Chiến dịch", value: "campaigns", path: "/manager/campaigns" },
        { label: "Quản lý Quyên Góp", value: "donations", path: "/manager/donations" },
        { label: "Quản lý bão", value: "storms", path: "/manager/storms" },
    ];

    return (
        <Box sx={{ mb: 3 }}>
            <div className="tab-list-container">
                <ul className="tab-list">
                    {tabs.map((tab) => (
                        <li
                            key={tab.value}
                            className={activeTab === tab.value ? "active" : ""}
                            onClick={() => {
                                onTabChange(tab.value);
                                if (tab.path) navigate(tab.path);
                            }}
                        >
                            {tab.label}
                        </li>
                    ))}
                </ul>
            </div>
        </Box>
    );
};

export default ManagerTabs;