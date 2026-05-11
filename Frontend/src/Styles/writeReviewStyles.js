import { Dimensions, StyleSheet } from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const BASE_WIDTH = 390;

const scaleByWidth = (size) => (screenWidth / BASE_WIDTH) * size;
const clampScale = (size, min, max) => {
  const scaled = scaleByWidth(size);
  return Math.min(Math.max(scaled, min), max);
};

export const ui = {
  iconBack: clampScale(27, 24, 31),
  iconClose: clampScale(26, 22, 30),
  iconSelect: clampScale(22, 18, 24),
  iconSave: clampScale(18, 16, 20),
  star: clampScale(29, 24, 34),
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F8",
  },

  keyboardContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#F3F4F8",
    paddingHorizontal: "5%",
  },

  header: {
    paddingTop: 8,
    paddingBottom: "2.5%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#D7DBE5",
  },

  headerIconButton: {
    width: clampScale(36, 34, 42),
    height: clampScale(36, 34, 42),
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: clampScale(25, 20, 27),
    fontWeight: "700",
    color: "#161D2F",
  },

  formSection: {
    paddingTop: "4%",
    gap: 10,
  },

  formScroll: {
    flex: 1,
  },

  formScrollContent: {
    paddingBottom: 16,
  },

  label: {
    fontSize: clampScale(26, 18, 30),
    fontWeight: "700",
    color: "#252C3C",
    marginTop: 6,
  },

  readOnlyInput: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#C8CFDE",
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: "#F7F8FC",
  },

  readOnlyText: {
    fontSize: clampScale(26, 17, 29),
    color: "#8A8F9D",
  },

  selectorInput: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#C8CFDE",
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectorText: {
    fontSize: clampScale(26, 17, 29),
    color: "#252C3C",
    fontWeight: "600",
    flex: 1,
    paddingRight: 8,
  },

  ratingRow: {
    marginTop: 4,
  },

  starsRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  starTouch: {
    paddingVertical: 4,
    paddingRight: 2,
  },

  commentInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#C8CFDE",
    borderRadius: 16,
    minHeight: 192,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: clampScale(25, 16, 28),
    color: "#1F2535",
    backgroundColor: "#FFFFFF",
  },

  footer: {
    paddingTop: 12,
    paddingBottom: 12,
  },

  saveButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: "#1E5BE0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0F255D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: clampScale(23, 15, 26),
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(22, 31, 53, 0.45)",
    justifyContent: "flex-end",
  },

  modalCard: {
    maxHeight: "55%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
  },

  modalTitle: {
    fontSize: clampScale(24, 18, 26),
    fontWeight: "700",
    color: "#131A2A",
    marginBottom: 14,
  },

  modalOption: {
    paddingVertical: 14,
  },

  modalOptionText: {
    fontSize: clampScale(22, 16, 24),
    color: "#1F2535",
  },

  modalSeparator: {
    height: 1,
    backgroundColor: "#E6EAF3",
  },
});
