import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", 
  },

  background: {
    flex: 1,
    backgroundColor: "#6F7BEF",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(244, 247, 252, 0.65)",
    justifyContent: "center",
  },

  // 
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30,
  },

  formContainer: {
    marginHorizontal: 20,
    paddingHorizontal: 22,
    paddingVertical: 26,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(30, 91, 224, 0.18)",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1B2B4A",
  },

  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "rgba(30, 91, 224, 0.35)",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    marginBottom: 15,
    color: "#1B2B4A",
  },

  link: {
    color: "#1E5BE0",
    fontSize: 13,
    marginBottom: 20,
  },

  button: {
    height: 50,
    backgroundColor: "rgba(30, 91, 224, 0.14)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(30, 91, 224, 0.55)",
  },

  buttonText: {
    color: "#1E5BE0",
    fontSize: 16,
    fontWeight: "700",
  },

  registerContainer: {
    marginTop: 18,
    alignItems: "center",
  },

  registerText: {
    fontSize: 13,
    color: "#1B2B4A",
  },

  registerLink: {
    color: "#1E5BE0",
    fontWeight: "bold",
  },

  checkboxContainer: {
    marginTop: 10,
    marginBottom: 20,
  },

  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  checkboxLabel: {
    marginLeft: 10,
  },
});

export default styles;