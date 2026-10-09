
import { StyleSheet } from "react-native";
import { colors } from "./theme";

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },

    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 20,
    },

    subtitle: {
        fontSize: 16,
        color: colors.secondaryText,
        marginBottom: 15,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.text,
        marginTop: 20,
        marginBottom: 12,
    },

    card: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
    },

    button: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },

    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 18,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});

export default globalStyles;
