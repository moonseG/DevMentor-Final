import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  StyleSheet, 
  TextInput
} from "react-native";
import {Calendar, LocaleConfig}  from "react-native-calendars";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from 'expo-sharing';
import { getAccessToken, getCurrentUser } from "../services/sessionService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { styles, colors } from "../Styles/AdvisorProfileStyle";
import { API_URL, apiFetch } from "../config/api";

LocaleConfig.locales["es"] = {
  monthNames: [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ],
  monthNamesShort: [
    'Ene','Feb','Mar','Abr','May','Jun',
    'Jul','Ago','Sep','Oct','Nov','Dic'
  ],
  dayNames: [
    'Domingo','Lunes','Martes','Miércoles',
    'Jueves','Viernes','Sábado'
  ],
  dayNamesShort: [
    'Dom','Lun','Mar','Mié','Jue','Vie','Sáb'
  ],
  today: 'Hoy'
};

LocaleConfig.defaultLocale = "es";

export default function AdvisorProfile({ route, navigation }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [loading, setLoading] = useState(true);

  const [ modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState("");
  const [ selectedDate, setSelectedDate] = useState('');


  const advisorParam = route?.params?.advisor || {};
  const routeIsOwnProfile = route?.params?.isOwnProfile === true;

  const [availableHours, setAvailableHours] = useState([]);
  const hoy = new Date().toISOString().split("T")[0];

  const getDisponibilidad = async (dia, fechaSeleccionada) => {
    try {
      const response = await apiFetch(
        `/calendario/disponibilidad?id_perfil=${advisor.id_perfil}&dia_semana=${dia}`
      );

      if (!response.ok) return;

      const data = await response.json();

      if (!data || data.length === 0) {
        setAvailableHours([]);
        return;
      }

      let horas = [];

      data.forEach((rango) => {
        let inicio = parseInt(rango.hora_inicio.split(":")[0]);
        let fin = parseInt(rango.hora_fin.split(":")[0]);

        for (let h = inicio; h < fin; h++) {
          horas.push(`${h.toString().padStart(2, "0")}:00`);
        }
      });

      const citas = await getCitasPorFecha(fechaSeleccionada);
      
      const horasOcupadas = citas.map((cita) =>
        cita.hora.slice(0, 5)
      );
      
      const horasDisponibles = horas.filter(
        (hora) => !horasOcupadas.includes(hora)
      );

      setAvailableHours(horasDisponibles);

    } catch (err) {
      console.log(err);
    }
  };

  const getCitasPorFecha = async (fecha) => {
    try {
      const response = await apiFetch(
        `/calendario/citas/asesor/${advisor.id_perfil}`
      );

      if (!response.ok) return [];

      const citas = await response.json();

      const citasDelDia = citas.filter(
        (cita) => cita.fecha === fecha
      );

      return citasDelDia;

    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const [advisor, setAdvisor] = useState({
    id_usuario_auth: advisorParam?.id_usuario_auth || null,
    id_perfil: advisorParam?.id_perfil || null,
    name: advisorParam.name || "Asesor",
    role: advisorParam.role || "Asesor",
    especialidad: advisorParam.especialidad || "No especificada",
    materias: Array.isArray(advisorParam.materias) ? advisorParam.materias : [],
    aprobado: Boolean(advisorParam.aprobado),
    correo: advisorParam.correo || "No disponible",
    telefono: advisorParam.telefono || "No disponible",
    materiales: [],
    estadisticas: advisorParam.estadisticas || {
      alumnosAtendidos: 0,
      calificacionPromedio: 0,
      horasAsesoradas: 0,
    },
  });

  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const getUserData = () => {
    const currentUser = getCurrentUser();
    console.log("currentUser desde sesión:", currentUser); // para verificar las claves
    if (currentUser) {
      setUserRole(currentUser.rol);
      setUserId(currentUser.id || currentUser.id_usuario || currentUser.sub);
    }
  };

  const isMyProfile = useMemo(() => {
    if (routeIsOwnProfile) return true; // viene del drawer
    if (!userId || !advisor?.id_usuario_auth) return false;
    return String(userId) === String(advisor.id_usuario_auth);
  }, [routeIsOwnProfile, userId, advisor.id_usuario_auth]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getAdvisorProfile = async () => {
    if (advisorParam.id_perfil) {
      const response = await apiFetch(`/advisors/${advisorParam.id_perfil}`);
      if (response.ok) return response.json();
    }

    if (advisorParam.id_usuario_auth) {
      const response = await apiFetch(`/advisors/user/${advisorParam.id_usuario_auth}`);
      if (response.ok) return response.json();
    }

    return null;
  };

  const getUserById = async (idUsuario) => {
    if (!idUsuario) return null;

    const response = await apiFetch(`/auth/users/${idUsuario}`);
    if (!response.ok) return null;
    return response.json();
  };

  const getMateriasMap = async () => {
    const response = await apiFetch("/materias");
    if (!response.ok) return {};

    const materias = await response.json();
    if (!Array.isArray(materias)) return {};

    return materias.reduce((acc, materia) => {
      acc[materia.id] = materia.nombre;
      return acc;
    }, {});
  };

  const getMaterialesPorPerfil = async (idPerfil) => {
    try {
      const response = await apiFetch(
        `/contents/perfil/${idPerfil}`
      );

      if (!response.ok) return [];

      return await response.json();
    } catch (error) {
      return [];
    }
  };

  const agendarCita = async () => {
    try {
      const response = await apiFetch("/calendario/citas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_perfil: advisor.id_perfil,
          id_usuario: userId, // usuario logueado real
          fecha: selectedDate,
          hora: selectedHour
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Error al agendar cita");
        return;
      }

      alert("Cita agendada correctamente");
      setModalVisible(false);

    } catch (error) {
      console.log(error);
      alert("Error de conexión");
    }
  };

  const descargarArchivo = async (idContenido, nombreArchivo) => {
    try {
      const token = getAccessToken();

      const url = `${API_URL}/contents/download/${idContenido}`;
      const fileUri = FileSystem.documentDirectory + nombreArchivo;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert("Archivo descargado en: " + uri);
      }

    } catch (error) {
      console.log(error);
      alert("Error descargando archivo");
    }
  };

  const eliminarArchivo = async (idContenido) => {

    try {
      await apiFetch(
        `/contents/${idContenido}`,
        {
          method: "DELETE",
        }
      );

      // Recargar datos
      cargarDatosAsesor();

    } catch (error) {}
  };

  const cargarDatosAsesor = async () => {
    try {
      const advisorProfile = await getAdvisorProfile();

      if (!advisorProfile) {
        setLoading(false);
        return;
      }

      const [user, materiasMap, materiales] = await Promise.all([
        getUserById(advisorProfile.id_usuario_auth),
        getMateriasMap(),
        getMaterialesPorPerfil(advisorProfile.id_perfil),
      ]);

      const materiasNombres = Array.isArray(advisorProfile.materias)
        ? advisorProfile.materias.map((materia) => {
            if (typeof materia === "number") {
              return materiasMap[materia] || `Materia ${materia}`;
            }
            return materia;
          })
        : [];

      setAdvisor((prev) => ({
        ...prev,
        id_perfil: advisorProfile.id_perfil,
        id_usuario_auth: advisorProfile.id_usuario_auth,
        name: user?.nombre || prev.name,
        role: advisorProfile.area_especialidad || user?.rol || prev.role,
        especialidad: advisorProfile.especialidad || prev.especialidad,
        materias: materiasNombres.length > 0 ? materiasNombres : prev.materias,
        aprobado: Boolean(advisorProfile.aprobado),
        correo: user?.correo || prev.correo,
        telefono: user?.telefono || prev.telefono,
        materiales: materiales, // nuevo
      }));
    } catch (error) {
      // Si falla la API, se mantienen los datos de fallback.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosAsesor();
    getUserData();
  }, []);

  const archivosPorMateria = useMemo(() => {
    const materias = Array.isArray(advisor.materias) ? advisor.materias : [];

    if (materias.length === 0) {
      return {
        "Sin materias registradas": [
          { id: 1, nombre: "Aun no hay material disponible.pdf", tipo: "pdf" },
        ],
      };
    }

    return materias.reduce((acc, materia, index) => {
      acc[materia] = [
        {
          id: index + 1,
          nombre: `Material base de ${materia}.pdf`,
          tipo: "pdf",
        },
      ];
      return acc;
    }, {});
  }, [advisor.materias]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.text.secondary }}>
            Cargando perfil del asesor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log("=== DEBUG BOTÓN SUBIR ===");
  console.log("userRole:", userRole);
  console.log("isMyProfile:", isMyProfile);
  console.log("advisor.aprobado:", advisor.aprobado);
  console.log("routeIsOwnProfile:", routeIsOwnProfile);
  console.log("userId:", userId);
  console.log("advisor.id_usuario_auth:", advisor.id_usuario_auth);
  console.log("=========================");
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <Image source={require("../../assets/icons/user.png")} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{advisor.name}</Text>
              <Text style={styles.profileRole}>{advisor.role}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="school" size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Especialidad: </Text>
                {advisor.especialidad}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="book" size={20} color={colors.info} />
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Materias: </Text>
                {Array.isArray(advisor.materias) && advisor.materias.length > 0
                  ? advisor.materias.join(", ")
                  : "No especificadas"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="mail" size={20} color={colors.orange} />
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Correo: </Text>
                {advisor.correo}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="call" size={20} color={colors.success} />
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Telefono: </Text>
                {advisor.telefono}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitle}>
            <MaterialIcons name="analytics" size={24} color={colors.primary} />
            <Text style={styles.sectionTitleText}>Estadisticas</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{advisor.estadisticas.alumnosAtendidos}</Text>
              <Text style={styles.statLabel}>Alumnos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{advisor.estadisticas.calificacionPromedio}</Text>
              <Text style={styles.statLabel}>Calificacion</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{advisor.estadisticas.horasAsesoradas}</Text>
              <Text style={styles.statLabel}>Horas</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          {userRole === "Estudiante" && (
            <TouchableOpacity 
              style={styles.actionButton} 
              activeOpacity={0.7} 
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Agendar</Text>
            </TouchableOpacity>
          )}

          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Selecciona una fecha</Text>

                <Calendar
                  minDate={hoy}
                  onDayPress={(day) => {
                    setSelectedDate(day.dateString);
                    setSelectedHour("");

                    const date = new Date(day.dateString);
                    const dias = [
                      "lunes","martes","miercoles",
                      "jueves","viernes","sabado", "domingo"
                    ];

                    const diaSemana = dias[date.getDay()];

                    getDisponibilidad(diaSemana, day.dateString);
                  }}
                  markedDates={{
                    [selectedDate]: {
                      selected: true,
                      selectedColor: "#6C63FF",
                    },
                  }}
                />

                {selectedDate && (
                  <>
                    <Text style={{ marginTop: 15, fontWeight: "bold" }}>
                      Selecciona un horario
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",

                        marginTop: 10,
                      }}
                    >
                      {availableHours.map((hour) => (
                        <TouchableOpacity
                          key={hour}
                          onPress={() => setSelectedHour(hour)}
                          style={{
                            backgroundColor:
                              selectedHour === hour ? "#6C63FF" : "#E5E5E5",
                            padding: 10,
                            borderRadius: 8,
                            margin: 5,
                          }}
                        >
                          <Text
                            style={{
                              color: selectedHour === hour ? "white" : "black",
                              fontWeight: "bold",
                            }}
                          >
                            {hour}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <TouchableOpacity
                  style={{
                    marginTop: 15,
                    backgroundColor: 
                      availableHours.length === 0 ? "#ccc" : "#6C63FF",                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  disable={availableHours.length === 0}
                  onPress={agendarCita}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Confirmar cita
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: "white" }}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          {/* SOLO MI PERFIL */}
          {userRole === "Asesor" && isMyProfile && advisor.aprobado && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("UploadMaterialScreen", { advisor })}
            >
              <Ionicons name="cloud-upload" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Subir material</Text>
            </TouchableOpacity>
          )}
          {userRole === "Asesor" && isMyProfile && advisor.aprobado && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Disponibilidad", { advisor })}
            >
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Disponibilidad</Text>
            </TouchableOpacity>
          )}
          

        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.expandableHeader}
            onPress={() => toggleSection("materiales")}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitle}>
              <Ionicons name="folder" size={24} color={colors.primary} />
              <Text style={styles.sectionTitleText}>Materiales disponibles</Text>
            </View>
            <Ionicons
              name={expandedSection === "materiales" ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>

          {expandedSection === "materiales" && (
            <View style={styles.expandableContent}>
              {advisor.materiales && advisor.materiales.length > 0 ? (

                advisor.materiales.map((archivo) => (

                  <View
                    key={archivo.id_contenido}
                    style={styles.archivoItem}
                  >

                    <Text
                      style={styles.archivoNombre}
                      numberOfLines={1}
                    >
                      {archivo.nombre_archivo}
                    </Text>

                    <View style={{ flexDirection: "row" }}>

                      {/* Descargar */}
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() =>
                          descargarArchivo(
                            archivo.id_contenido,
                            archivo.nombre_archivo
                          )
                        }
                      >
                        <Ionicons
                          name="download"
                          size={18}
                          color={colors.primary}
                        />
                      </TouchableOpacity>

                      {/* Eliminar SOLO admin o asesor */}
                      {(userRole === "admin" || (userRole === "Asesor" && isMyProfile)) && (
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() =>
                            eliminarArchivo(
                              archivo.id_contenido
                            )
                          }
                        >
                          <Ionicons
                            name="trash"
                            size={18}
                            color="red"
                          />
                        </TouchableOpacity>
                      )}

                    </View>

                  </View>

                ))

              ) : (

                <Text
                  style={{
                    color: colors.text.secondary,
                    marginTop: 10,
                  }}
                >
                  No hay materiales disponibles.
                </Text>

              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
