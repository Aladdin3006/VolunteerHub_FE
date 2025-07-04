import { Box, Typography } from '@mui/material';

interface CustomDividerProps {
    label?: string;
    labelPosition?: 'left' | 'right' | 'center';
    lineColor?: string;
    dotColor?: string;
    textColor?: string;
    textBorderColor?: string;
    fontSize?: number | string;
    height?: number;
    dotSize?: number;
    lineThickness?: number;
    borderRadius?: number | string;
}

export default function DotDivider({
    label = 'LABEL',
    labelPosition = 'right',
    lineColor = 'white',
    dotColor = 'white',
    textColor = 'white',
    textBorderColor = 'white',
    fontSize = 12,
    height = 40,
    dotSize = 16,
    lineThickness = 2,
    borderRadius = 20,
}: CustomDividerProps) {
    const Dot = (
        <Box
            sx={{
                width: dotSize,
                height: dotSize,
                backgroundColor: dotColor,
                borderRadius: '50%',
                flexShrink: 0,
            }}
        />
    );

    const Line = <Box sx={{
        flexGrow: 1,
        height: lineThickness,
        backgroundColor: lineColor,
    }} />;

    const Label = (
        <Box
            sx={{
                border: `2px solid ${textBorderColor}`,
                borderRadius,
                px: 2,
                py: 0.5,
                backgroundColor: 'transparent',
                flexShrink: 0,
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    fontSize,
                    fontWeight: 'bold',
                    color: textColor,
                    letterSpacing: 2,
                    whiteSpace: 'nowrap',
                }}
            >
                {label}
            </Typography>
        </Box>
    );

    let content;

    if (labelPosition === 'left') {
        content = (
            <>
                {Label}
                {Dot}
                {Line}
            </>
        );
    } else if (labelPosition === 'center') {
        content = (
            <>
                {Line}
                {Dot}
                {Label}
                {Line}
            </>
        );
    } else { // right
        content = (
            <>
                {Dot}
                {Line}
                {Label}
            </>
        );
    }

    return (
        <Box sx={{ width: '100%', height, display: 'flex', alignItems: 'center' }}>
            {content}
        </Box>
    );
}
