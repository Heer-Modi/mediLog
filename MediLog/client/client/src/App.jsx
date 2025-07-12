import React from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

function App() {
return (
<Container maxWidth="sm" style={{ marginTop: "4rem", textAlign: "center" }}>
<Typography variant="h4" gutterBottom>
MediLog - Personal Medical Record Portal
</Typography>
<Button variant="contained" color="primary">
Get Started
</Button>
</Container>
);
}

export default App;

 