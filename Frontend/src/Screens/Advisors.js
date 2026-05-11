import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../config/api";

export default function Advisors({ navigation, route }) {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAsesores();
  }, []);

  const getUserById = async (idUsuario) => {
    try {
      const response = await apiFetch(`/auth/users/${idUsuario}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(
          `[Advisors] auth/users/${idUsuario} fallo: ${response.status} - ${errorText}`
        );
        return null;
      }

      return await response.json();
    } catch (error) {
      console.log(`[Advisors] auth/users/${idUsuario} error de red:`, error);
      return null;
    }
  };

  const cargarAsesores = async () => {
    try {
      const response = await apiFetch("/advisors");
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        console.log("[Advisors] /advisors respuesta invalida:", response.status, data);
        setAdvisors([]);
        return;
      }

      const advisorsWithUser = await Promise.all(
        data.map(async (advisor) => {
          const user = await getUserById(advisor.id_usuario_auth);

          // Requerimos usuario en auth y que su rol sea 'asesor' (case-insensitive)
          if (!user) {
            console.log(
              `[Advisors] Sin auth para id_usuario_auth=${advisor.id_usuario_auth}, se descarta`
            );
            return null;
          }

          const roleStr = user?.rol?.toString()?.toLowerCase() || "";
          const isAuthAdvisor = roleStr.includes("asesor");

          if (!isAuthAdvisor) {
            console.log(
              `[Advisors] Usuario ${user?.nombre || advisor?.id_usuario_auth} tiene rol ${user?.rol}, se descarta`
            );
            return null;
          }

          return {
            ...advisor,
            id: advisor.id_perfil?.toString() || String(advisor.id_usuario_auth),
            name: user?.nombre || advisor?.nombre || `Asesor #${advisor.id_usuario_auth}`,
            correo: user?.correo || "No disponible",
            telefono: user?.telefono || "No disponible",
            role: user?.rol || advisor?.area_especialidad || "Asesor",
          };
        })
      );

      // Filtrar los null y valores falsy
      setAdvisors(advisorsWithUser.filter(Boolean));
    } catch (error) {
      console.log("[Advisors] Error cargando asesores:", error);
      setAdvisors([]);
    } finally {
      setLoading(false);
    }
  };

  
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("AdvisorProfile", {
          advisor: item,
          isOwnProfile: false, 
        })
      }
      activeOpacity={0.7}
    >
      <Image source={require("../../assets/icons/user.png")} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>{item.role}</Text>
      </View>
    </TouchableOpacity>
  );

  const nombreMateria = route?.params?.nombreMateria || "Asesores";
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{nombreMateria}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1E5BE0" />
      ) : (
        <FlatList
          data={advisors}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay asesores disponibles por ahora.</Text>
          }
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0f172a",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: "#e6f3ff",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  role: {
    color: "#64748b",
    marginTop: 3,
    fontSize: 13,
  },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 24,
  },
});
