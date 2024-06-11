import { alpha, createTheme } from "@mui/material";

export function progressBeforeCSS(
    progress,
    color,
    active = !progress || progress < 100,
) {
    return {
        content: "''",
        position: "absolute",
        left: 0,
        width: `${progress}%`,
        height: "100%",
        backgroundColor: color,
        transition: "width 300ms",
        zIndex: 0,
        ...(active
            ? {
                  backgroundImage: `linear-gradient(-45deg, rgba(50, 50, 50, 0.125) 25%, transparent 25%, transparent 50%, rgba(50, 50, 50, 0.125) 50%, rgba(50, 50, 50, 0.125) 75%, transparent 75%, transparent)`,
                  backgroundSize: "35px 35px",
                  animation: "cssProgressActive 2s linear infinite",
              }
            : {}),
    };
}
export const SHINE_EFFECT_STYLE = {
    WebkitMaskImage:
        "linear-gradient(-75deg, rgba(0,0,0,.6) 30%, #000 50%, rgba(0,0,0,.6) 70%)",
    WebkitMaskSize: "200%",
    animation: "shine 2s infinite",
};

const theme = createTheme({
    palette: {
        mode: "dark",
        background: {
            main: "#0A0A0A",
            paper: "#0A0A0A",
            default: "#0A0A0A",
            light: "#1E1E1E",
            dark: "#000000",
            hairline: "#181818",
            disabledBackground: "#282828",
            disabled: alpha("#282828", 0.2),
            disabledBorder: alpha("#282828", 0.5),
        },
        secondary: {
            main: "#74717B",
            dark: alpha("#FFFFFF", 0.12),
        },
        primary: {
            main: "#3C1DD6",
            light: "#8D93FF",
            dark: alpha("#3C1DD6", 0.2),
            lighter: "#BBB5D9",
            border: alpha("#3C1DD6", 0.4),
            darkContrastForShineEffect: "#4C28FF",
        },
        error: {
            main: "#D00000",
            contrastText: "#FFFFFF",
            dark: alpha("#D00000", 0.2),
            darkContrastText: "#D00000",
        },
        yellow: {
            main: "#FBE540",
            contrastText: "#000000",
            vibrant: "#FCB500",
            dark: alpha("#D66B1D", 0.2),
            darkContrastText: "#D66B1D",
        },
        warning: {
            main: "#FFB74D",
            contrastText: "#FFC700",
            // Taken from MUI default values
            dark: "#F57C00",
            light: "#FFB74D",
        },
        green: {
            main: alpha("#00D222", 0.2),
            contrastText: "#00D222",
        },
        white: {
            main: "#FFFFFF",
            contrastText: "#3C1DD6",
        },
        darkHeader: {
            main: "#140E33", // Same as primary.dark, but MUI doesn't let us give a "subcolor" to AppBar
        },
    },
    typography: (palette) => ({
        fontFamily:
            "-apple-system, BlinkMacSystemFont, Inter, Roboto, Arial, sans-serif",
        body1: {
            fontSize: 14,
            lineHeight: "16.94px",
            color: palette.white.main,
        },
        body2: {
            fontSize: 12,
            fontWeight: 500,
            lineHeight: "14.52px",
            color: palette.secondary.main,
        },
        small: {
            fontSize: 12,
            lineHeight: "14.52px",
            color: palette.secondary.main,
        },
        h6: {
            fontSize: 18,
            lineHeight: "20px",
        },
        h7: {
            fontSize: 16,
            lineHeight: "18px",
            fontWeight: 700,
        },
    }),
    components: {
        MuiAccordion: {
            styleOverrides: {
                root: ({ ownerState, theme }) => ({
                    background: theme.palette.primary.dark,
                    borderRadius: 10,
                    borderStyle: "dashed",
                    borderColor: theme.palette.primary.border,
                    borderWidth: 2,
                    margin: "1rem",
                    "::before": {
                        opacity: 0,
                    },
                    "&.Mui-expanded": {
                        marginLeft: "1rem",
                        marginRight: "1rem",
                    },
                    "&.Mui-expanded:first-of-type, &.Mui-expanded:last-of-type":
                        {
                            marginTop: "1rem",
                            marginBottom: "1rem",
                        },
                    "&:first-of-type": {
                        borderRadius: 10,
                    },
                    "&:last-of-type": {
                        borderRadius: 10,
                    },
                }),
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: ({ ownerState, theme }) => ({
                    minHeight: 50,
                    "&.Mui-expanded": {
                        minHeight: 50,
                        height: 50,
                    },
                }),
            },
        },
        MuiAccordionDetails: {
            styleOverrides: {
                root: ({ ownerState, theme }) => ({
                    background: theme.palette.background.main,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                }),
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: ({ ownerState, theme }) => ({
                    backgroundColor: theme.palette[ownerState.color]?.main,
                    backgroundImage: "none",
                }),
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState?.size
                        ? {
                              width: ownerState.size,
                              height: ownerState.size,
                              borderRadius: (ownerState.size / 5) * 2,
                              fontSize: ownerState.size * 0.55,
                              lineHeight: "normal",
                          }
                        : {
                              // Default size is 40
                              borderRadius: (40 / 5) * 2,
                          }),
                }),
            },
        },
        MuiAvatarGroup: {
            styleOverrides: {
                root: () => ({
                    ".MuiAvatar-root": {
                        border: "none",
                    },
                }),
            },
        },
        MuiAlert: {
            styleOverrides: {
                message: { padding: "0.725rem 0" },
                action: {
                    ":has(>:not(.MuiIconButton-root))": {
                        paddingTop: 0,
                        whiteSpace: "nowrap",
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: ({ ownerState, theme }) => ({
                    fontWeight: "bold",
                    textTransform: "none",
                    borderRadius: 10,
                    padding: 20,
                    ...(ownerState.size === "large"
                        ? {
                              fontSize: 25,
                              fontWeight: 800,
                          }
                        : {}),
                    ...(ownerState.size === "medium"
                        ? {
                              fontSize: 14,
                              fontWeight: 700,
                              padding: 10,
                              minHeight: 50,
                          }
                        : {}),
                    ...(ownerState.size === "small"
                        ? {
                              fontSize: 12,
                              fontWeight: 700,
                              padding: 0,
                              paddingLeft: 10,
                              paddingRight: 10,
                              minHeight: 35,
                          }
                        : {}),
                    "&.Mui-disabled": {
                        backgroundColor:
                            theme.palette.background.disabledBackground,
                        color: theme.palette.secondary.main,
                    },
                }),
            },
        },
        MuiLoadingButton: {
            defaultProps: {
                variant: "contained",
                loadingPosition: "start",
                fullWidth: true,
            },
        },
        MuiList: {
            styleOverrides: {
                root: {
                    width: "100%",
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                    paddingTop: 0,
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    width: "100%",
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: "0.5rem",
                    paddingBottom: "0.5rem",
                    "&:first-of-type": {
                        paddingTop: "1rem",
                    },
                    "&:last-of-type": {
                        paddingBottom: "1.5rem",
                    },
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.secondary.main,
                    fontFamily: "Inter",
                    fontSize: 14,
                    fontStyle: "normal",
                    textTransform: "none",
                    fontWeight: 700,
                    lineHeight: "normal",
                    minWidth: 0,
                    padding: 5,
                    "&.Mui-selected": {
                        color: theme.palette.white.main,
                    },
                    "&::after": {
                        content: "''",
                        display: "block",
                        width: "100%",
                        height: 5,
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                        backgroundColor: "transparent",
                        position: "absolute",
                        bottom: 0,
                    },
                    "&.Mui-selected::after": {
                        backgroundColor: theme.palette.primary.main,
                    },
                }),
                wrapper: {
                    alignItems: "center",
                },
                indicator: {
                    backgroundColor: "transparent",
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderBottom: `solid 1px ${theme.palette.background.hairline}`,
                    paddingLeft: 16,
                    paddingRight: 16,
                }),
                textColorInherit: ({ theme }) => ({
                    color: theme.palette.secondary.main,
                    opacity: 1,
                    "&$selected": {
                        color: theme.palette.white.main,
                    },
                }),
                indicator: {
                    backgroundColor: "transparent",
                },
                scrollButtons: ({ theme }) => ({
                    color: theme.palette.secondary.main,
                    "&:first-of-type": {
                        justifyContent: "flex-start",
                        marginLeft: -5,
                    },
                    "&:last-child": {
                        justifyContent: "flex-end",
                        marginRight: -5,
                    },
                }),
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                notchedOutline: ({ theme }) => ({
                    borderRadius: 10,
                    borderColor: theme.palette.background.hairline,
                }),
                root: ({ theme, ownerState }) => ({
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: ownerState.error
                            ? theme.palette.error.main
                            : theme.palette.primary.main,
                    },
                }),
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: ({ theme, ownerState }) => ({
                    width: "100%",
                    backgroundColor: theme.palette.background.main,
                    borderRadius: "18px",
                    ...(ownerState.InputProps?.readOnly
                        ? {
                              "& .MuiInputBase-root input": {
                                  fontWeight: 800,
                                  fontSize: "18px",
                              },
                              "& .MuiInputBase-root fieldset.MuiOutlinedInput-notchedOutline, & .MuiInputBase-root:hover fieldset.MuiOutlinedInput-notchedOutline, & .MuiInputBase-root.Mui-focused fieldset.MuiOutlinedInput-notchedOutline":
                                  {
                                      borderColor:
                                          theme.palette.background.hairline,
                                  },
                              "& > label, & > label.Mui-Focused": {
                                  color: `${theme.palette.secondary.main}!important`,
                              },
                          }
                        : {}),
                }),
            },
        },
        MuiCard: {
            defaultProps: {
                variant: "outlined",
                color: "primary",
            },
            styleOverrides: {
                root: ({ theme, ownerState }) => {
                    let borderColor;
                    if (ownerState.color === "primary") {
                        borderColor = theme.palette.primary.border;
                    } else {
                        borderColor =
                            theme.palette[ownerState.color]?.dark ??
                            alpha(theme.palette.white.main, 0.1);
                    }

                    return {
                        width: "100%",
                        borderRadius: 10,
                        border: `solid 1px ${borderColor}`,
                    };
                },
            },
        },
        MuiCardHeader: {
            defaultProps: {
                color: "primary",
                progress: 100,
            },
            styleOverrides: {
                root: ({ theme, ownerState }) => ({
                    position: "relative",
                    padding: "0.5rem 1rem",
                    "::before": progressBeforeCSS(
                        ownerState.progress,
                        theme.palette[ownerState.color]?.dark ??
                            alpha(theme.palette.white.main, 0.1),
                        ownerState.animate,
                    ),
                }),
                content: {
                    position: "relative",
                    zIndex: 1,
                },
                avatar: ({ theme, ownerState }) => ({
                    position: "relative",
                    marginRight: "0.5rem",
                    zIndex: 1,
                    " .MuiSvgIcon-root": {
                        fontSize: 15,
                        color:
                            theme.palette[ownerState.color]?.lighter ||
                            theme.palette[ownerState.color]?.light ||
                            theme.palette.white.main,
                    },
                }),
                title: ({ theme, ownerState }) => ({
                    fontSize: 12,
                    color:
                        theme.palette[ownerState.color]?.lighter ??
                        theme.palette.white.main,
                }),
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.5rem",
                    "&:last-child": {
                        paddingBottom: "0.75rem",
                    },
                },
            },
        },
        MuiCardActions: {
            styleOverrides: {
                root: {
                    paddingTop: 0,
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                    paddingBottom: "0.75rem",
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderColor: theme.palette.background.hairline,
                }),
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    "& .MuiSlider-rail": {
                        height: 8,
                    },
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                switchBase: ({ theme }) => ({
                    "& .MuiSwitch-thumb": {
                        backgroundColor: theme.palette.white.main,
                    },
                    "&.Mui-checked": {
                        "& .MuiSwitch-thumb": {
                            backgroundColor: theme.palette.primary.lighter,
                        },
                    },
                }),
            },
        },
        MuiTooltip: {
            defaultProps: {
                placement: "top",
                enterTouchDelay: 10,
                leaveTouchDelay: 10000,
                sx: { cursor: "help" },
            },
        },
    },
    breakpoints: {
        values: {
            xs: 0, // Extra small devices
            sm: 600, // Small devices
            md: 900, // Mobile breakpoint
            lg: 1250, // Tablet breakpoint
            xl: 1536, // Extra large devices
        },
    },
});

export default theme;
