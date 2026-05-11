import React, { useEffect, useState } from "react";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LogBox,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";

import Dashboard from "./src/Screens/Dashboard";
import Advisors from "./src/Screens/Advisors";
import Login from "./src/Screens/Login";
import Register from "./src/Screens/Register";
import AdvisorProfile from "./src/Screens/AdvisorProfile";
import AdvisorProfileSetup from "./src/Screens/AdvisorProfileSetup";
import ReviewScreen from "./src/Screens/ReviewScreen";
import WriteReviewScreen from "./src/Screens/WriteReviewScreen";
import UploadMaterialScreen from "./src/Screens/UploadMaterialScreen";
import MyAccount from "./src/Screens/MyAccount";
import Disponibilidad from "./src/Screens/DisponibilidadScreen";
import MisAsesorias from "./src/Screens/MisAsesorias";
import EscanearQR   from "./src/Screens/EscanearQR";
import { clearCurrentUser, getCurrentUser } from "./src/services/sessionService"


const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

const { width: screenWidth } = Dimensions.get("window");
const BASE_WIDTH = 390;
const scaleByWidth = (size) => (screenWidth / BASE_WIDTH) * size;
const clampScale = (size, min, max) => {
  const scaled = scaleByWidth(size);
  return Math.min(Math.max(scaled, min), max);
};

function AppDrawer({ visible, onClose }) {
  const currentUser = getCurrentUser();

  const goTo = (routeName) => {
    onClose();

    if (navigationRef.isReady()) {
      navigationRef.navigate(routeName);
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    onClose();

    if (navigationRef.isReady()) {
      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={drawerStyles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <SafeAreaView style={drawerStyles.panelWrapper}>
          <View style={drawerStyles.panel}>
            <View style={drawerStyles.profileHeader}>
              <Image
                source={
                  currentUser?.profileImageUri
                    ? { uri: currentUser.profileImageUri }
                    : require("./assets/icons/user.png")
                }
                style={drawerStyles.avatar}
              />
              <Text style={drawerStyles.userName} numberOfLines={1}>
                {currentUser?.nombre || "Mi cuenta"}
              </Text>
              <Text style={drawerStyles.userMail} numberOfLines={1}>
                {currentUser?.correo || "Sesión activa"}
              </Text>
              {currentUser?.rol ? (
                <View style={drawerStyles.rolePill}>
                  <Text style={drawerStyles.roleText}>{currentUser.rol}</Text>
                </View>
              ) : null}
            </View>

            <View style={drawerStyles.menuSection}>
              <TouchableOpacity style={drawerStyles.menuItem} onPress={() => goTo("DevMentor")}>
                <Ionicons name="home-outline" size={20} color="#1E5BE0" />
                <Text style={drawerStyles.menuText}>Inicio</Text>
              </TouchableOpacity>

              <TouchableOpacity style={drawerStyles.menuItem} onPress={() => goTo("Asesores")}>
                <Ionicons name="people-outline" size={20} color="#1E5BE0" />
                <Text style={drawerStyles.menuText}>Asesores</Text>
              </TouchableOpacity>

              <TouchableOpacity style={drawerStyles.menuItem} onPress={() => goTo("MiCuenta")}>
                <Ionicons name="person-circle-outline" size={20} color="#1E5BE0" />
                <Text style={drawerStyles.menuText}>Ver mi cuenta</Text>
              </TouchableOpacity>

              {currentUser?.rol === "Asesor" && (
                <TouchableOpacity 
                  style={drawerStyles.menuItem} 
                  onPress={() => {
                    onClose();
                    if (navigationRef.isReady()) {
                      navigationRef.navigate("AdvisorProfile", {
                        advisor: {
                          id_usuario_auth: currentUser?.id,
                        },
                        isOwnProfile: true, 
                      });
                    }
                  }}
                >
                  <Ionicons name="briefcase-outline" size={20} color="#1E5BE0" />
                  <Text style={drawerStyles.menuText}>Ver mi perfil de asesor</Text>
                </TouchableOpacity>
              )}

              {/* Mis asesorías — solo Asesores */}
              {currentUser?.rol === "Asesor" && (
                <TouchableOpacity style={drawerStyles.menuItem} onPress={() => goTo("MisAsesorias")}>
                  <Ionicons name="calendar-outline" size={20} color="#1E5BE0" />
                  <Text style={drawerStyles.menuText}>Mis asesorías</Text>
                </TouchableOpacity>
              )}

              {/* Escanear QR — solo Estudiantes */}
              {currentUser?.rol === "Estudiante" && (
                <TouchableOpacity style={drawerStyles.menuItem} onPress={() => goTo("EscanearQR")}>
                  <Ionicons name="qr-code-outline" size={20} color="#1E5BE0" />
                  <Text style={drawerStyles.menuText}>Escanear QR</Text>
                </TouchableOpacity>
              )}

            </View>

            <TouchableOpacity
              style={[drawerStyles.menuItem, drawerStyles.logoutItem]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#D92D20" />
              <Text style={[drawerStyles.menuText, drawerStyles.logoutText]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default function App() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    Asset.loadAsync([require("./assets/icons/img_login.png")]);
  }, []);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <NavigationContainer ref={navigationRef}>
      <AppDrawer visible={drawerVisible} onClose={closeDrawer} />

      <Stack.Navigator>

        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DevMentor"
          component={Dashboard}
          options={() => ({
            title: "DevMentor",
            headerLeft: () => (
              <TouchableOpacity onPress={openDrawer} style={appStyles.menuButton}>
                <Ionicons name="menu" size={24} color="#1E5BE0" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigationRef.navigate("ReviewScreen")}
                style={appStyles.reviewsIconButton}
              >
                <Image
                  source={require("./assets/icons/resenas_usuario.png")}
                  style={appStyles.reviewsIcon}
                />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen 
          name="Asesores" 
          component={Advisors}
          options={{
            title: "Asesores",
            headerLeft: () => (
              <TouchableOpacity onPress={openDrawer} style={appStyles.menuButton}>
                <Ionicons name="menu" size={24} color="#1E5BE0" />
              </TouchableOpacity>
            ),
          }}
        />

        <Stack.Screen
          name="AdvisorProfile" 
          component={AdvisorProfile} 
          options={{
            title: "Perfil del Asesor",
            headerLeft: () => (
              <TouchableOpacity onPress={openDrawer} style={appStyles.menuButton}>
                <Ionicons name="menu" size={24} color="#1E5BE0" />
              </TouchableOpacity>
            ),
          }}
        />

        <Stack.Screen
          name="Disponibilidad" 
          component={Disponibilidad} 
          options={{
            title: "Configurar Disponibilidad",
            headerLeft: () => (
              <TouchableOpacity onPress={openDrawer} style={appStyles.menuButton}>
                <Ionicons name="menu" size={24} color="#1E5BE0" />
              </TouchableOpacity>
            ),
          }}
        />

        <Stack.Screen
          name="MiCuenta"
          component={MyAccount}
          options={{
            title: "Mi cuenta",
            headerLeft: () => (
              <TouchableOpacity onPress={openDrawer} style={appStyles.menuButton}>
                <Ionicons name="menu" size={24} color="#1E5BE0" />
              </TouchableOpacity>
            ),
          }}
        />

        <Stack.Screen
          name="AdvisorProfileSetup" 
          component={AdvisorProfileSetup} 
          options={{ title: "Configurar Perfil de Asesor", headerShown: false }}
        />

        <Stack.Screen
          name="ReviewScreen"
          component={ReviewScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="WriteReviewScreen"
          component={WriteReviewScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="UploadMaterialScreen"
          component={UploadMaterialScreen}
          options={{ title: "Subir Material" }}
        />
        
        <Stack.Screen 
          name="Register" 
          component={Register} 
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="MisAsesorias"
          component={MisAsesorias}
          options={{
            title: "Mis asesorías",
            headerLeft: () => (
              <TouchableOpacity onPress={openDrawer} style={appStyles.menuButton}>
                <Ionicons name="menu" size={24} color="#1E5BE0" />
              </TouchableOpacity>
            ),
          }}
        />

        <Stack.Screen
          name="EscanearQR"
          component={EscanearQR}
          options={{ title: "Escanear QR", headerShown: false }}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}

const drawerStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "flex-start",
  },
  panelWrapper: {
    flex: 1,
    width: "82%",
    maxWidth: 340,
  },
  panel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 24,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#EFF6FF",
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  userMail: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  rolePill: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EAF2FF",
  },
  roleText: {
    color: "#1E5BE0",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "capitalize",
  },
  menuSection: {
    paddingTop: 12,
    gap: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  logoutItem: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 18,
  },
  logoutText: {
    color: "#D92D20",
  },
});

const appStyles = StyleSheet.create({
  menuButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 999,
  },
  reviewsIconButton: {
    marginRight: 8,
    width: clampScale(42, 36, 48),
    height: clampScale(42, 36, 48),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  reviewsIcon: { //tamaño del icono de reseñas
    width: clampScale(42, 36, 48),
    height: clampScale(42, 36, 48),
    resizeMode: "contain",
    backgroundColor: "transparent",
  },
});

LogBox.ignoreLogs([
  "VirtualizedLists should never be nested",
]);