import { AppBar, Box, Toolbar, Typography } from "@mui/material"

const MainView = () => {
    return <>
        <AppBar position="sticky">
            <Toolbar>
                <Box display="flex" justifyContent="space-between" width="100%">
                    <Typography
                        noWrap
                        variant="h5"
                        sx={{
                            display: {
                                xs: "none",
                                lg: "block",
                            },
                        }}
                    >
                        Sail Wrapped 2024
                    </Typography>
                    <Box display="flex" alignItems="center" ml={2}>
                    </Box>
                    {/* <Box display="flex" gap={2} alignItems="center">
                        <Box
                            component="img"
                            src={`${DISCORD_CDN_BASE}/avatars/${userState.user?.id}/${userState.user?.avatar}.png?size=32`}
                            sx={{ borderRadius: "50%" }}
                        />
                        <Typography
                            noWrap
                            sx={{
                                display: {
                                    xs: "none",
                                    md: "block",
                                },
                            }}
                        >
                            Logged in as {userState.user?.global_name}
                        </Typography>
                        <Button onClick={onLogout}>Logout</Button>
                    </Box> */}
                </Box>
            </Toolbar>
        </AppBar></>
}

export default MainView;