// Hardcoded demo credentials for this prototype's mock auth. Not real
// password storage — just enough to gate the login screen with something
// other than a free role picker.

export const SUPERVISOR_CREDENTIALS = {
  email: "james.kariuki@fieldwatch.go.ke",
  password: "FieldWatch2026!",
};

// All field officers share one demo password; the actual identity is
// selected from the officer dropdown on the login screen.
export const OFFICER_PASSWORD = "Officer2026!";
