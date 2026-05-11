import { Dimensions, StyleSheet } from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const BASE_WIDTH = 390;

const scaleByWidth = (size) => (screenWidth / BASE_WIDTH) * size;
const clampScale = (size, min, max) => {
	const scaled = scaleByWidth(size);
	return Math.min(Math.max(scaled, min), max);
};

export const ui = {
	iconBack: clampScale(28, 24, 32),
	iconWrite: clampScale(18, 16, 22),
	star: clampScale(24, 20, 28)
};

export const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#F3F4F8"
	},

	container: {
		flex: 1,
		backgroundColor: "#F3F4F8",
		paddingHorizontal: "4.5%"
	},

	header: {
		paddingTop: 8,
		paddingBottom: "2.5%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center"
	},

	headerIconButton: {
		width: clampScale(38, 34, 44),
		height: clampScale(38, 34, 44),
		alignItems: "center",
		justifyContent: "center"
	},

	headerSpacer: {
		width: clampScale(38, 34, 44),
		height: clampScale(38, 34, 44)
	},

	headerTitle: {
		fontSize: clampScale(22, 19, 26),
		fontWeight: "700",
		color: "#121826"
	},

	list: {
		flex: 1
	},

	listContent: {
		paddingTop: "2%",
		paddingBottom: "5%",
		gap: 14
	},

	reviewCard: {
		width: "100%",
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		paddingVertical: "4%",
		paddingHorizontal: "3.8%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2
	},

	topRow: {
		flexDirection: "row",
		alignItems: "center"
	},

	avatar: {
		width: 52,
		height: 52,
		borderRadius: 26,
		marginRight: "3%",
		backgroundColor: "#E8EBF2"
	},

	userMeta: {
		flex: 1
	},

	studentName: {
		fontSize: clampScale(17, 15, 21),
		fontWeight: "700",
		color: "#182033"
	},

	timeAgo: {
		marginTop: 2,
		fontSize: clampScale(14, 12, 17),
		color: "#8C94A8"
	},

	exactTime: {
		marginTop: 2,
		fontSize: clampScale(13, 11, 16),
		color: "#A0A7B8"
	},

	middleRow: {
		marginTop: "3%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end"
	},

	starsRow: {
		flexDirection: "row",
		alignItems: "center"
	},

	starIcon: {
		marginRight: 2
	},

	advisorMeta: {
		flexShrink: 1,
		alignItems: "flex-start",
		marginLeft: "2.5%"
	},

	advisorLabel: {
		fontSize: clampScale(14, 12, 17),
		color: "#8C94A8"
	},

	advisorName: {
		marginTop: 2,
		fontSize: clampScale(17, 15, 21),
		color: "#141D2F",
		fontWeight: "700"
	},

	commentText: {
		marginTop: "3.5%",
		fontSize: clampScale(17, 15, 21),
		lineHeight: clampScale(23, 20, 28),
		color: "#80889B"
	},

	footer: {
		paddingTop: "2.5%",
		paddingBottom: 12
	},

	footerMessage: {
		fontSize: clampScale(22, 18, 26),
		lineHeight: clampScale(32, 27, 38),
		fontWeight: "500",
		color: "#737A8D",
		marginBottom: "3.5%"
	},

	writeButton: {
		backgroundColor: "#1E5BE0",
		width: "100%",
		minHeight: 56,
		borderRadius: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.16,
		shadowRadius: 5,
		elevation: 4
	},

	writeButtonText: {
		color: "#FFFFFF",
		fontSize: clampScale(18, 15, 22),
		fontWeight: "700"
	}
});
