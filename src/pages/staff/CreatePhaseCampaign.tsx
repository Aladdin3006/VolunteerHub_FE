import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  TextField, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Chip,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  ExpandMore as ExpandMoreIcon, 
  Delete as DeleteIcon,
  LocationOn,
  CalendarToday,
  Task
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Task {
  id: string;
  name: string;
  description: string;
}

interface PhaseDay {
  id: string;
  date: Date | null;
  location: {
    coordinates: [number, number] | null;
    address: string;
  };
  tasks: Task[];
}

interface Phase {
  id: string;
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  days: PhaseDay[];
}

// Separate component for handling map clicks - must be inside MapContainer
const MapClickHandler: React.FC<{
  phaseId: string;
  dayId: string;
  updateDayLocation: (phaseId: string, dayId: string, coordinates: [number, number], address: string) => void;
}> = ({ phaseId, dayId, updateDayLocation }) => {
  useMapEvent('click', (e) => {
    updateDayLocation(
      phaseId,
      dayId,
      [e.latlng.lat, e.latlng.lng],
      `Location selected at ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`
    );
  });
  
  return null; // This component doesn't render anything
};

const CreatePhaseCampaign: React.FC = () => {
  // State for the entire form
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 'phase-1',
      name: '',
      description: '',
      startDate: null,
      endDate: null,
      days: [
        {
          id: 'day-1-1',
          date: null,
          location: {
            coordinates: null,
            address: ''
          },
          tasks: [
            { id: 'task-1-1-1', name: '', description: '' }
          ]
        }
      ]
    }
  ]);

  // Add a new phase
  const addPhase = () => {
    const newPhase: Phase = {
      id: `phase-${Date.now()}`,
      name: '',
      description: '',
      startDate: null,
      endDate: null,
      days: [
        {
          id: `day-${Date.now()}-1`,
          date: null,
          location: {
            coordinates: null,
            address: ''
          },
          tasks: [
            { id: `task-${Date.now()}-1`, name: '', description: '' }
          ]
        }
      ]
    };
    setPhases([...phases, newPhase]);
  };

  // Update phase details
  const updatePhase = (phaseId: string, field: keyof Phase, value: any) => {
    setPhases(phases.map(phase => 
      phase.id === phaseId ? { ...phase, [field]: value } : phase
    ));
  };

  // Delete a phase
  const deletePhase = (phaseId: string) => {
    if (phases.length <= 1) return;
    setPhases(phases.filter(phase => phase.id !== phaseId));
  };

  // Add a new day to a phase
  const addDayToPhase = (phaseId: string) => {
    const newDay: PhaseDay = {
      id: `day-${Date.now()}`,
      date: null,
      location: {
        coordinates: null,
        address: ''
      },
      tasks: [
        { id: `task-${Date.now()}`, name: '', description: '' }
      ]
    };
    
    setPhases(phases.map(phase => 
      phase.id === phaseId 
        ? { ...phase, days: [...phase.days, newDay] } 
        : phase
    ));
  };

  // Update day details
  const updateDay = (phaseId: string, dayId: string, field: keyof PhaseDay, value: any) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          days: phase.days.map(day => 
            day.id === dayId ? { ...day, [field]: value } : day
          )
        };
      }
      return phase;
    }));
  };

  // Update day location
  const updateDayLocation = (phaseId: string, dayId: string, coordinates: [number, number], address: string) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          days: phase.days.map(day => 
            day.id === dayId 
              ? { 
                  ...day, 
                  location: { 
                    coordinates, 
                    address 
                  } 
                } 
              : day
          )
        };
      }
      return phase;
    }));
  };

  // Delete a day from a phase
  const deleteDay = (phaseId: string, dayId: string) => {
    if ((phases.find(p => p.id === phaseId)?.days.length ?? 0) <= 1) return;
    
    setPhases(phases.map(phase => 
      phase.id === phaseId 
        ? { ...phase, days: phase.days.filter(day => day.id !== dayId) } 
        : phase
    ));
  };

  // Add a task to a day
  const addTaskToDay = (phaseId: string, dayId: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: '',
      description: ''
    };
    
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          days: phase.days.map(day => 
            day.id === dayId 
              ? { ...day, tasks: [...day.tasks, newTask] } 
              : day
          )
        };
      }
      return phase;
    }));
  };

  // Update a task
  const updateTask = (phaseId: string, dayId: string, taskId: string, field: keyof Task, value: string) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          days: phase.days.map(day => 
            day.id === dayId
              ? {
                  ...day,
                  tasks: day.tasks.map(task => 
                    task.id === taskId ? { ...task, [field]: value } : task
                  )
                }
              : day
          )
        };
      }
      return phase;
    }));
  };

  // Delete a task
  const deleteTask = (phaseId: string, dayId: string, taskId: string) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          days: phase.days.map(day => 
            day.id === dayId
              ? {
                  ...day,
                  tasks: day.tasks.filter(task => task.id !== taskId)
                }
              : day
          )
        };
      }
      return phase;
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted phases:', phases);
    // API call would go here
    alert('Phases created successfully!');
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Box sx={{ 
      marginLeft: '280px', 
      padding: '30px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, marginTop: '40px' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Create Campaign Phases
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Campaign Phases
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Add phases to your campaign. Each phase can have multiple days with specific tasks.
          </Typography>
          
          {phases.map((phase, phaseIndex) => (
            <Accordion key={phase.id} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ flex: 1 }}>
                    {phase.name || `Phase ${phaseIndex + 1}`}
                  </Typography>
                  <Chip 
                    label={`${phase.days.length} days`} 
                    size="small" 
                    color="info" 
                    variant="outlined"
                  />
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhase(phase.id);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid>
                    <TextField
                      fullWidth
                      label="Phase Name"
                      value={phase.name}
                      onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
                      margin="normal"
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Description"
                      value={phase.description}
                      onChange={(e) => updatePhase(phase.id, 'description', e.target.value)}
                      margin="normal"
                      multiline
                      rows={3}
                    />
                    
                    <Grid container spacing={2}>
                      <Grid>
                        <TextField
                          fullWidth
                          label="Start Date"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          value={phase.startDate ? phase.startDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => updatePhase(phase.id, 'startDate', new Date(e.target.value))}
                          margin="normal"
                          required
                        />
                      </Grid>
                      <Grid>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          value={phase.endDate ? phase.endDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => updatePhase(phase.id, 'endDate', new Date(e.target.value))}
                          margin="normal"
                          required
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid>
                    <Typography variant="subtitle2" gutterBottom>
                      Phase Days
                    </Typography>
                    
                    {phase.days.map((day, dayIndex) => (
                      <Accordion key={day.id} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography sx={{ flex: 1 }}>
                              {formatDate(day.date) || `Day ${dayIndex + 1}`}
                            </Typography>
                            <IconButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDay(phase.id, day.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </AccordionSummary>
                        
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid>
                              <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={day.date ? day.date.toISOString().split('T')[0] : ''}
                                onChange={(e) => updateDay(phase.id, day.id, 'date', new Date(e.target.value))}
                                margin="normal"
                                required
                              />
                            </Grid>
                            
                            <Grid>
                              <Typography variant="subtitle2" gutterBottom>
                                Check-in Location
                              </Typography>
                              
                              <TextField
                                fullWidth
                                label="Address"
                                value={day.location.address}
                                onChange={(e) => updateDay(phase.id, day.id, 'location', {
                                  ...day.location,
                                  address: e.target.value
                                })}
                                margin="normal"
                                required
                              />
                              
                              <Box sx={{ height: 200, mt: 2, borderRadius: 1, overflow: 'hidden' }}>
                                <MapContainer
                                  center={day.location.coordinates || [21.0278, 105.8342]}
                                  zoom={13}
                                  style={{ height: '100%', width: '100%' }}
                                >
                                  <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                  />
                                  <MapClickHandler
                                    phaseId={phase.id}
                                    dayId={day.id}
                                    updateDayLocation={updateDayLocation}
                                  />
                                  {day.location.coordinates && (
                                    <Marker position={day.location.coordinates}>
                                      <Popup>
                                        Check-in Location
                                      </Popup>
                                    </Marker>
                                  )}
                                </MapContainer>
                              </Box>
                            </Grid>
                            
                            <Grid>
                              <Typography variant="subtitle2" gutterBottom>
                                Tasks
                              </Typography>
                              
                              {day.tasks.map((task, taskIndex) => (
                                <Box key={task.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">
                                      Task {taskIndex + 1}
                                    </Typography>
                                    <IconButton 
                                      size="small"
                                      onClick={() => deleteTask(phase.id, day.id, task.id)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                  
                                  <TextField
                                    fullWidth
                                    label="Task Name"
                                    value={task.name}
                                    onChange={(e) => updateTask(phase.id, day.id, task.id, 'name', e.target.value)}
                                    margin="dense"
                                    required
                                  />
                                  
                                  <TextField
                                    fullWidth
                                    label="Description"
                                    value={task.description}
                                    onChange={(e) => updateTask(phase.id, day.id, task.id, 'description', e.target.value)}
                                    margin="dense"
                                    multiline
                                    rows={2}
                                  />
                                </Box>
                              ))}
                              
                              <Button 
                                variant="outlined" 
                                startIcon={<AddIcon />}
                                onClick={() => addTaskToDay(phase.id, day.id)}
                                size="small"
                              >
                                Add Task
                              </Button>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                    
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => addDayToPhase(phase.id)}
                      sx={{ mt: 2 }}
                    >
                      Add Day
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
          
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={addPhase}
            sx={{ mt: 2 }}
          >
            Add Phase
          </Button>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            sx={{ minWidth: 120 }}
          >
            Save Phases
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreatePhaseCampaign; 