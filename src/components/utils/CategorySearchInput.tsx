import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  AutocompleteProps,
  TextFieldProps,
} from "@mui/material";
import { CAMPAIGN_API, ICategory } from "../../apis/campaign-new";

interface IProps {
  onChange: (value: ICategory | null) => void;
  value?: ICategory | null;
  slotProps?: {
    autocomplete: AutocompleteProps<any, any, any, any>;
    textfield: TextFieldProps;
  };
  suggestText?: string;
}

const CategorySearchInput: React.FC<IProps> = ({
  onChange,
  value,
  slotProps,
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
    try {
      setLoading(true);
      const res = await CAMPAIGN_API.searchCategories(query);
      setOptions(res.data); // Make sure res.data is an array of Category
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
      {...slotProps?.autocomplete}
      fullWidth
      getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      value={value || null}
      onChange={(_, newValue) => {
        setInputValue("");
        onChange(newValue);
      }}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      onFocus={() => debounceSearch("")}
      renderInput={(params) => (
        <TextField
          {...params}
          {...slotProps?.textfield}
          fullWidth
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
        />
      )}
    />
  );
};

export default CategorySearchInput;
