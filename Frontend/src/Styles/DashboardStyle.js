import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingTop: 0,
  },
  contentConteiner: {
    paddingHorizontal: 10
  },

  scrollContent: {
    paddingBottom: 24
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20
  },

  carouselContainer: {
    marginTop: 0,
    marginBottom: 30,
  },

  carouselItem: {
    width: width,
    height: 200,
    overflow: "hidden",
  },

  carouselImage: {
    width: "100%",
    height: "100%",
  },

  card: {
    width: 350,
    marginRight: 15,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 230,
  },

  image: {
    height: 130
  },

  subject: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10
  },

  description: {
    fontSize: 14,
    color: "#555",
    marginTop: 5
  },

  sectionHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 20,
  marginBottom: 10,
},

line: {
  width: 4,
  height: 22,
  backgroundColor: "#7B2CBF", // morado moderno
  borderRadius: 5,
  marginRight: 10,
},

sectionTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#1E1E1E",
  letterSpacing: 0.5,
},

});