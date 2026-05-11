import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Checkbox from "expo-checkbox";
import styles from "../Styles/RegistroStyle";
import { API_URL } from "../config/api";
import { setAccessToken, setCurrentUser } from "../services/sessionService";

export default function Register({ navigation }) {

  const [nombre, setNombre] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [errorTelefono, setErrorTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;
  const [showPassword, setShowPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const redirectTimeoutRef = useRef(null);

  const [estudiante, setEstudiante] = useState(false);
  const [asesor, setAsesor] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const registrarUsuario = async () => {

    if (!nombre || !correo || !telefono || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (!correo.endsWith("@unach.mx")) {
      Alert.alert("Error", "Debe usar un correo institucional @unach.mx");
      return;
    }

    if (!estudiante && !asesor) {
      Alert.alert("Error", "Seleccione un rol");
      return;
    }

    if (!/^\d{10}$/.test(telefono)) {
      setErrorTelefono("El teléfono debe tener exactamente 10 dígitos");
      return;
    }

    const rol = estudiante ? "Estudiante" : "Asesor";

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre,
          correo,
          telefono,
          contrasena: password,
          rol
        })
      });

      const data = await response.json();

      console.log("STATUS:", response.status);
      console.log("DATA:", data);

      if (!response.ok) {
        Alert.alert("Error", data.message || "Error del servidor");
        return;
      }

      setRegisterSuccess(true);

      let nextScreen = "Login";
      let nextParams;

      if (asesor) {
        try {
          const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              correo,
              contrasena: password,
            }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok && loginData?.access_token && loginData?.usuario?.id) {
            setCurrentUser({
              id: Number(loginData.usuario.id),
              nombre: loginData.usuario.nombre,
              correo: loginData.usuario.correo,
              rol: loginData.usuario.rol,
              foto_perfil: loginData.usuario.foto_perfil || "",
              profileImageUri: loginData.usuario.foto_perfil || "",
            });
            setAccessToken(loginData.access_token);

            nextScreen = "AdvisorProfileSetup";
            nextParams = {
              userId: Number(loginData.usuario.id),
              nombre: loginData.usuario.nombre || nombre,
            };
          } else {
            Alert.alert(
              "Aviso",
              "Registro exitoso. Inicia sesion para completar tu perfil de asesor."
            );
          }
        } catch (_error) {
          Alert.alert(
            "Aviso",
            "Registro exitoso. Inicia sesion para completar tu perfil de asesor."
          );
        }
      }

      redirectTimeoutRef.current = setTimeout(() => {
        navigation.navigate(nextScreen, nextParams);
      }, 2500);

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo registrar el usuario");
    }
  };

  if (registerSuccess) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.overlay}>
          <View style={styles.formContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={[styles.title, { marginTop: 16 }]}>Registro completado</Text>
            <Text style={styles.label}>Preparando tu acceso...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>

            <Text style={styles.title}>Registro</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={[
                styles.input,
                errorNombre ? { borderColor: "red" } : null
              ]}
              value={nombre}
              autoCapitalize="words"
              keyboardType="default"
              onChangeText={(text) => {
                const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/;

                if (regex.test(text)) {
                  setNombre(text);
                  setErrorNombre("");
                } else {
                  setErrorNombre("El nombre solo puede contener letras y espacios");
                }
              }
            }
            />

            {errorNombre ? (
              <Text style={{ color : "red", matginBottom: 10}}>
                {errorNombre}
              </Text>
            ) : null}

            <Text style={styles.label}>Correo</Text>
            <TextInput
              style={styles.input}
              placeholder="nombre@unach.mx"
              value={correo}
              onChangeText={setCorreo}
            />

            <Text style={styles.label}>Telefono</Text>
              <TextInput
                style={[
                  styles.input,
                  errorTelefono ? { borderColor: "red" } : null
                ]}
                placeholder="0000000000"
                keyboardType="number-pad"
                maxLength={10}
                value={telefono}
                onChangeText={(text) => {
                  const soloNumeros = text.replace(/[^0-9]/g, "");
                  setTelefono(soloNumeros);

                  if (soloNumeros.length === 10) {
                    setErrorTelefono("");
                  } else {
                    setErrorTelefono("El teléfono debe tener exactamente 10 dígitos");
                  }
                }}
              />

              {errorTelefono ? (
                <Text style={{ color: "red", marginBottom: 10 }}>
                  {errorTelefono}
                </Text>
              ) : null}

            <Text style={styles.label}>Contraseña</Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={styles.input}
                  placeholder="Crea una contraseña"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);

                    if (!passwordRegex.test(text)) {
                      setErrorPassword(
                        "La contraseña no cumple con los requisitos de seguridad: mínimo 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial"
                      );
                    } else {
                      setErrorPassword("");
                    }
                  }}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 15,
                    top: 15,
                  }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#666"
                    />
                </TouchableOpacity>
              </View>

              {errorPassword ? (
                <Text style={{ color: "red", marginBottom: 10 }}>
                  {errorPassword}
                </Text>
              ) : null}

            <TextInput
              style={styles.input}
              placeholder="Confirma la contraseña"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Text style={styles.label}>Rol</Text>

            <View style={styles.checkboxContainer}>

              <View style={styles.checkboxItem}>
                <Checkbox
                  value={estudiante}
                  onValueChange={() => {
                    setEstudiante(true);
                    setAsesor(false);
                  }}
                />
                <Text style={styles.checkboxLabel}>Estudiante</Text>
              </View>

              <View style={styles.checkboxItem}>
                <Checkbox
                  value={asesor}
                  onValueChange={() => {
                    setAsesor(true);
                    setEstudiante(false);
                  }}
                />
                <Text style={styles.checkboxLabel}>Asesor</Text>
              </View>

            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Ya tienes una cuenta?{" "}
                <Text
                  style={styles.registerLink}
                  onPress={() => navigation.navigate("Login")}
                >
                  Inicia sesión
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={registrarUsuario}
            >
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}