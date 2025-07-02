import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Theme,
  SxProps,
} from "@mui/material";
import { CAMPAIGN_API, ICategory } from "../../apis/campaign-new";

interface IProps {
  onChange: (value: ICategory | null) => void;
  value?: ICategory | null;
  autoCompleteSx?: SxProps<Theme>;
  textfieldSx?: SxProps<Theme>;
  suggestText?: string;
}

const CategorySearchInput: React.FC<IProps> = ({
  onChange,
  value,
  autoCompleteSx,
  textfieldSx,
  suggestText,
}) => {
  const [options, setOptions] = useState<ICategory[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Debounce logic: avoid firing API calls on every keystroke
  const debounceSearch = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout>;
    return (query: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fetchCategories(query);
      }, 500); // wait 500ms after the user stops typing
    };
  }, []);

  // Fetch categories from API based on the input query
  const fetchCategories = async (query: string) => {
    if (!query) {
      setOptions([]);
      return;
    }

    try {
      setLoading(true);
      const categories = await CAMPAIGN_API.searchCategories(query);
      setOptions(categories); // Make sure res.data is an array of Category
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Run search when input value changes
  useEffect(() => {
    debounceSearch(inputValue);
  }, [inputValue]);

  return (
    <Autocomplete
      fullWidth
      getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      value={value || null}
      onChange={(_, newValue) => onChange(newValue)}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={suggestText || "Search category"}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={textfieldSx}
        />
      )}
      sx={autoCompleteSx}
    />
  );
};

export default CategorySearchInput;
