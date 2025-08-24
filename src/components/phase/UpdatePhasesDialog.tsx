import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import {
  Typography,
  Button,
  Paper,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  Stack,
  Box,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { ILocation, IPhaseData, IPhaseDayData } from "../../apis/campaign";
import * as yup from "yup";
import { useFormik } from "formik";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import MapLocationPicker, { ICoordinates } from "../utils/MapLocationPicker";

interface IFormData {
  phases: IPhaseData[];
}

const DEFAULT_CENTER: ICoordinates = {
  lat: 21.028511,
  lng: 105.804817,
};

// Location schema
const locationSchema = yup.object({
  coordinates: yup
    .array()
    .of(yup.number().required())
    .length(2, "Toạ độ phải bao gồm lat và lng")
    .required("Toạ độ là bắt buộc"),
  address: yup.string().required("Địa chỉ là bắt buộc"),
});

// Phase day schema
const phaseDaySchema = yup.object({
  date: yup.date().required("Ngày là bắt buộc"),
  location: locationSchema.required("Địa điểm là bắt buộc"),
});

// Phase schema
const phaseSchema = yup.object({
  _id: yup.string().required(),
  name: yup.string().required("Tên giai đoạn là bắt buộc"),
  description: yup.string().required("Mô tả là bắt buộc"),
  startDate: yup.date().required("Ngày bắt đầu là bắt buộc"),
  endDate: yup
    .date()
    .required("Ngày kết thúc là bắt buộc")
    .min(yup.ref("startDate"), "Ngày kết thúc phải sau ngày bắt đầu"),
  phaseDays: yup.array().of(phaseDaySchema).required(),
});

// Form data schema
const formDataSchema = yup.object({
  phases: yup.array().of(phaseSchema).required(),
});

interface IProps extends Omit<DialogProps, "open"> {
  onSave: (phases: IPhaseData[]) => void;
}
export interface IUpdatePhasesDialogRef {
  open: (
    phases: IPhaseData[],
    options?: {
      defaultExpand?: string;
      createNew?: boolean;
    }
  ) => void;
}

const getDefaultStartDate = () => {
  const result = new Date();
  result.setHours(0);
  result.setMinutes(0);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
};

const getDefaultEndDate = () => {
  const result = getDefaultStartDate();
  result.setDate(result.getDate() + 7);
  return result;
};

export const UpdatePhasesDialog = forwardRef<IUpdatePhasesDialogRef, IProps>(
  (props, ref) => {
    const { onSave, ...rest } = props;
    const [open, setOpen] = useState<boolean>(false);
    const defaultExpandRef = useRef<string>("");

    const formik = useFormik<IFormData>({
      initialValues: {
        phases: [],
      },
      validationSchema: formDataSchema,
      onSubmit: async (values, { setSubmitting }) => {
        onSave(values.phases);
        setSubmitting(false);
        close();
      },
    });

    useImperativeHandle(ref, () => ({
      open: (
        phases: IPhaseData[],
        options?: {
          defaultExpand?: string;
          createNew?: boolean;
        }
      ) => {
        defaultExpandRef.current = options?.defaultExpand ?? "";
        if (options?.createNew) {
          const _id = `new-phase-${Date.now()}`;
          defaultExpandRef.current = _id;
          formik.setFieldValue("phases", [
            ...phases,
            {
              _id: _id,
              name: "",
              description: "",
              startDate: new Date(),
              endDate: new Date(),
              phaseDays: [],
            },
          ]);
        } else {
          formik.setFieldValue("phases", phases);
        }
        setOpen(true);
      },
    }));

    const close = () => {
      setOpen(false);
    };

    const addPhase = () => {
      formik.setFieldValue("phases", [
        ...formik.values.phases,
        {
          _id: `new-phase-${Date.now()}`,
          name: "",
          description: "",
          startDate: getDefaultStartDate(),
          endDate: getDefaultEndDate(),
          phaseDays: [],
        },
      ]);
    };

    const addPhaseDay = (phaseId: string) => {
      formik.setFieldValue("phases", [
        ...formik.values.phases.map((phase) => {
          if (phase._id === phaseId) {
            return {
              ...phase,
              phaseDays: [
                ...phase.phaseDays,
                {
                  id: `new-day-${Date.now()}`,
                  date: new Date(),
                  location: {
                    coordinates: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
                    address: "",
                  },
                },
              ],
            };
          } else {
            return phase;
          }
        }),
      ]);
    };

    const setPhaseStartDate = (phaseIndex: number, value: Date | undefined) => {
      formik.setFieldValue("phases", [
        ...formik.values.phases.map((phase, index) => {
          if (index === phaseIndex) {
            return {
              ...phase,
              startDate: value,
            };
          } else {
            return phase;
          }
        }),
      ]);
    };

    const setPhaseEndDate = (phaseIndex: number, value: Date | undefined) => {
      formik.setFieldValue("phases", [
        ...formik.values.phases.map((phase, index) => {
          if (index === phaseIndex) {
            return {
              ...phase,
              endDate: value,
            };
          } else {
            return phase;
          }
        }),
      ]);
    };

    const setPhaseDayDate = (
      phaseIndex: number,
      phaseDayIndex: number,
      value: Date | undefined
    ) => {
      formik.setFieldValue("phases", [
        ...formik.values.phases.map((phase, index) => {
          if (index === phaseIndex) {
            return {
              ...phase,
              phaseDays: phase.phaseDays.map((phaseDay, dayIndex) => {
                if (dayIndex === phaseDayIndex) {
                  return {
                    ...phaseDay,
                    date: value,
                  };
                } else {
                  return phaseDay;
                }
              }),
            };
          } else {
            return phase;
          }
        }),
      ]);
    };

    const setPhaseDayLocationCoordinates = (
      phaseIndex: number,
      phaseDayIndex: number,
      value: [number, number]
    ) => {
      formik.setFieldValue("phases", [
        ...formik.values.phases.map((phase, index) => {
          if (index === phaseIndex) {
            return {
              ...phase,
              phaseDays: phase.phaseDays.map((phaseDay, dayIndex) => {
                if (dayIndex === phaseDayIndex) {
                  return {
                    ...phaseDay,
                    location: {
                      ...phaseDay.location,
                      coordinates: value,
                    },
                  };
                } else {
                  return phaseDay;
                }
              }),
            };
          } else {
            return phase;
          }
        }),
      ]);
    };

    const removePhase = (phaseIndex: number) => {
      formik.setFieldValue(
        "phases",
        formik.values.phases.filter((_, index) => phaseIndex !== index)
      );
    };

    const removePhaseDay = (phaseIndex: number, phaseDayIndex: number) => {
      formik.setFieldValue("phases", [
        ...formik.values.phases.map((phase, phaseIdx) => {
          if (phaseIdx === phaseIndex) {
            return {
              ...phase,
              phaseDays: phase.phaseDays.filter(
                (_, dayIndex) => dayIndex !== phaseDayIndex
              ),
            };
          } else {
            return phase;
          }
        }),
      ]);
    };

    const iPhaseName = (phaseIndex: number, prop: keyof IPhaseData): string => {
      return `phases[${phaseIndex}].${prop}`;
    };

    const iPhaseDayName = (
      phaseIndex: number,
      phaseDayIndex: number,
      prop: keyof IPhaseDayData
    ): string => {
      return `phases[${phaseIndex}].phaseDays[${phaseDayIndex}].${prop}`;
    };

    const iPhaseDayLocationName = (
      phaseIndex: number,
      phaseDayIndex: number,
      prop: keyof ILocation
    ): string => {
      return `phases[${phaseIndex}].phaseDays[${phaseDayIndex}].location.${prop}`;
    };

    const phases = formik.values.phases;
    const touchedPhases = formik.touched.phases;
    const errorPhases = formik.errors.phases;

    const getPhaseNameHelperText = (phaseIndex: number): string | undefined => {
      const isTouched = !!(touchedPhases && touchedPhases[phaseIndex]?.name);
      if (!isTouched || errorPhases == null || typeof errorPhases === "string")
        return "";
      const errorData = errorPhases[phaseIndex];
      if (typeof errorData === "string") return "";
      return errorData?.name;
    };

    const getPhaseDescriptionHelperText = (
      phaseIndex: number
    ): string | undefined => {
      const isTouched = !!(
        touchedPhases && touchedPhases[phaseIndex]?.description
      );
      if (!isTouched || errorPhases == null || typeof errorPhases === "string")
        return "";
      const errorData = errorPhases[phaseIndex];
      if (typeof errorData === "string") return "";
      return errorData?.description;
    };

    const getPhaseStartDateHelperText = (
      phaseIndex: number
    ): string | undefined => {
      const isTouched = !!(
        touchedPhases && touchedPhases[phaseIndex]?.startDate
      );
      if (!isTouched || errorPhases == null || typeof errorPhases === "string")
        return "";
      const errorData = errorPhases[phaseIndex];
      if (typeof errorData === "string") return "";
      return errorData?.startDate && String(errorData?.startDate);
    };

    const getPhaseEndDateHelperText = (
      phaseIndex: number
    ): string | undefined => {
      const isTouched = !!(touchedPhases && touchedPhases[phaseIndex]?.endDate);
      if (!isTouched || errorPhases == null || typeof errorPhases === "string")
        return "";
      const errorData = errorPhases[phaseIndex];
      if (typeof errorData === "string") return "";
      return errorData?.endDate && String(errorData?.endDate);
    };

    const getPhaseDayDateHelperText = (
      phaseIndex: number,
      phaseDayIndex: number
    ): string | undefined => {
      const touchedPhaseDays =
        touchedPhases && touchedPhases[phaseIndex]?.phaseDays;
      const isTouched = !!(
        touchedPhaseDays && touchedPhaseDays[phaseDayIndex]?.date
      );
      if (!isTouched || errorPhases == null || typeof errorPhases === "string")
        return "";
      const errorData = errorPhases[phaseIndex];
      if (typeof errorData === "string") return "";
      const errorPhaseDays = errorData.phaseDays;
      if (errorPhaseDays == null || typeof errorPhaseDays === "string")
        return "";
      const errorPhaseDay = errorPhaseDays[phaseDayIndex];
      if (typeof errorPhaseDay === "string") return "";
      return errorPhaseDay?.date && String(errorPhaseDay?.date);
    };

    const getPhaseDayLocationAddressHelperText = (
      phaseIndex: number,
      phaseDayIndex: number
    ): string | undefined => {
      const touchedPhaseDays =
        touchedPhases && touchedPhases[phaseIndex]?.phaseDays;
      const isTouched = !!(
        touchedPhaseDays && touchedPhaseDays[phaseDayIndex]?.location?.address
      );
      if (!isTouched || errorPhases == null || typeof errorPhases === "string")
        return "";
      const errorData = errorPhases[phaseIndex];
      if (typeof errorData === "string") return "";
      const errorPhaseDays = errorData.phaseDays;
      if (errorPhaseDays == null || typeof errorPhaseDays === "string")
        return "";
      const errorPhaseDay = errorPhaseDays[phaseDayIndex];
      if (typeof errorPhaseDay === "string") return "";

      const errorLocation = errorPhaseDay?.location;
      if (errorLocation == null || typeof errorLocation === "string") return "";
      return errorLocation?.address;
    };

    return (
      <Dialog open={open} onClose={() => {}} fullWidth maxWidth="lg" {...rest}>
        <DialogTitle>Giai đoạn chiến dịch</DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form onSubmit={formik.handleSubmit}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Các giai đoạn
                </Typography>

                {phases.map((phase, phaseIndex) => {
                  return (
                    <Accordion
                      key={phase._id}
                      defaultExpanded={defaultExpandRef.current === phase._id}
                    >
                      <Stack direction={"row"}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">
                            {phase.name || `Giai đoạn mới`}
                          </Typography>
                        </AccordionSummary>
                        <IconButton
                          color="error"
                          sx={{ ml: 2, mr: 2 }}
                          onClick={() => {
                            removePhase(phaseIndex);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Stack>

                      <AccordionDetails>
                        <Box>
                          <Stack direction={"row"} gap={0.5}>
                            <TextField
                              label="Tên"
                              name={iPhaseName(phaseIndex, "name")}
                              fullWidth
                              value={formik.values.phases[phaseIndex].name}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={!!getPhaseNameHelperText(phaseIndex)}
                              helperText={getPhaseNameHelperText(phaseIndex)}
                            />

                            <TextField
                              label="Mô tả"
                              name={iPhaseName(phaseIndex, "description")}
                              multiline
                              minRows={1}
                              fullWidth
                              value={
                                formik.values.phases[phaseIndex].description
                              }
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={
                                !!getPhaseDescriptionHelperText(phaseIndex)
                              }
                              helperText={getPhaseDescriptionHelperText(
                                phaseIndex
                              )}
                            />
                            <DatePicker
                              value={dayjs(
                                formik.values.phases[phaseIndex].startDate
                              )}
                              name={iPhaseName(phaseIndex, "startDate")}
                              onChange={(value) => {
                                setPhaseStartDate(phaseIndex, value?.toDate());
                              }}
                              slotProps={{
                                textField: {
                                  name: iPhaseName(phaseIndex, "startDate"),
                                  fullWidth: true,
                                  onBlur: formik.handleBlur,
                                  label: "Bắt đầu",
                                  error:
                                    !!getPhaseStartDateHelperText(phaseIndex),
                                  helperText:
                                    getPhaseStartDateHelperText(phaseIndex),
                                },
                              }}
                            />
                            <DatePicker
                              value={dayjs(
                                formik.values.phases[phaseIndex].endDate
                              )}
                              name={iPhaseName(phaseIndex, "endDate")}
                              onChange={(value) => {
                                setPhaseEndDate(phaseIndex, value?.toDate());
                              }}
                              slotProps={{
                                textField: {
                                  name: iPhaseName(phaseIndex, "endDate"),
                                  fullWidth: true,
                                  onBlur: formik.handleBlur,
                                  label: "Kết thúc",
                                  error:
                                    !!getPhaseEndDateHelperText(phaseIndex),
                                  helperText:
                                    getPhaseEndDateHelperText(phaseIndex),
                                },
                              }}
                            />
                          </Stack>
                          <Stack direction={"column"} pt={1}>
                            <Typography variant="h6" gutterBottom>
                              Các ngày chiến dịch
                            </Typography>
                            <Stack direction={"column"} gap={1}>
                              {phase.phaseDays.map((day, phaseDayIndex) => {
                                return (
                                  <Paper key={day._id} sx={{ p: 1 }}>
                                    <Stack direction={"row"} gap={1}>
                                      <Stack direction={"column"}>
                                        <Typography
                                          variant="subtitle2"
                                          gutterBottom
                                        >
                                          Ngày chiến dịch
                                        </Typography>
                                        <DatePicker
                                          value={dayjs(
                                            formik.values.phases[phaseIndex]
                                              .phaseDays[phaseDayIndex].date
                                          )}
                                          format="YYYY/MM/DD"
                                          name={iPhaseDayName(
                                            phaseIndex,
                                            phaseDayIndex,
                                            "date"
                                          )}
                                          onChange={(value) => {
                                            setPhaseDayDate(
                                              phaseIndex,
                                              phaseDayIndex,
                                              value?.toDate()
                                            );
                                          }}
                                          slotProps={{
                                            textField: {
                                              name: iPhaseName(
                                                phaseIndex,
                                                "endDate"
                                              ),
                                              onBlur: formik.handleBlur,
                                              label: "Ngày",
                                              error:
                                                !!getPhaseDayDateHelperText(
                                                  phaseIndex,
                                                  phaseDayIndex
                                                ),
                                              helperText:
                                                getPhaseDayDateHelperText(
                                                  phaseIndex,
                                                  phaseDayIndex
                                                ),
                                            },
                                          }}
                                        />
                                        <Button
                                          variant="outlined"
                                          startIcon={<Delete color="error" />}
                                          onClick={() => {
                                            removePhaseDay(
                                              phaseIndex,
                                              phaseDayIndex
                                            );
                                          }}
                                          sx={{ mt: 2 }}
                                        >
                                          Xóa ngày này
                                        </Button>
                                      </Stack>
                                      <Stack
                                        direction={"column"}
                                        sx={{ flex: 1 }}
                                      >
                                        <Typography
                                          variant="subtitle2"
                                          gutterBottom
                                        >
                                          Vị trí check-in
                                        </Typography>
                                        <TextField
                                          label="Địa chỉ"
                                          name={iPhaseDayLocationName(
                                            phaseIndex,
                                            phaseDayIndex,
                                            "address"
                                          )}
                                          fullWidth
                                          value={
                                            phases[phaseIndex].phaseDays[
                                              phaseDayIndex
                                            ].location.address
                                          }
                                          onChange={formik.handleChange}
                                          onBlur={formik.handleBlur}
                                          error={
                                            !!getPhaseDayLocationAddressHelperText(
                                              phaseIndex,
                                              phaseDayIndex
                                            )
                                          }
                                          helperText={getPhaseDayLocationAddressHelperText(
                                            phaseIndex,
                                            phaseDayIndex
                                          )}
                                        />
                                        <MapLocationPicker
                                          mapHeight="200px"
                                          defaultLocation={{
                                            lat: phases[phaseIndex].phaseDays[
                                              phaseDayIndex
                                            ].location.coordinates[0],
                                            lng: phases[phaseIndex].phaseDays[
                                              phaseDayIndex
                                            ].location.coordinates[1],
                                          }}
                                          onPick={(coordinates) => {
                                            setPhaseDayLocationCoordinates(
                                              phaseIndex,
                                              phaseDayIndex,
                                              [coordinates.lat, coordinates.lng]
                                            );
                                          }}
                                        />
                                      </Stack>
                                    </Stack>
                                  </Paper>
                                );
                              })}
                            </Stack>
                            <Button
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() => addPhaseDay(phase._id)}
                              sx={{ mt: 1 }}
                            >
                              Thêm ngày chiến dịch
                            </Button>
                          </Stack>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addPhase}
                  sx={{ mt: 2 }}
                >
                  Thêm giai đoạn
                </Button>
              </Paper>
            </form>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "center" }}>
          <Button onClick={close} color="secondary">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formik.isValid || formik.isSubmitting}
            onClick={formik.submitForm}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
