import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Asset } from "expo-asset";
import styles from "../Styles/RegistroStyle";
import { API_URL,apiFetch } from "../config/api";
import { setAccessToken, setCurrentUser, updateCurrentUser } from "../services/sessionService";

export default function Login({ navigation }) {

  const backgroundSource = require("../../assets/icons/img_login.png");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    Asset.loadAsync([backgroundSource]);

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [backgroundSource]);

  const iniciarSesion = async () => {
    if (!correo || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo,
          contrasena: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.detail || "Credenciales incorrectas");
        return;
      }
      //el token se guarda aquí
      const usuario = data?.usuario;
      const accessToken = data?.access_token;
      if (!usuario?.id || !usuario?.nombre || !usuario?.correo) {
        Alert.alert("Error", "El login no devolvio los datos del usuario");
        return;
      }

      if (!accessToken) {
        Alert.alert("Error", "El login no devolvio el token de acceso");
        return;
      }

      setCurrentUser({
        id: Number(usuario.id),
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        foto_perfil: usuario.foto_perfil || "",
        profileImageUri: usuario.foto_perfil || "",
      });
      setAccessToken(accessToken);

      if (usuario.rol === "Asesor") {
        try {
          const perfilRes = await apiFetch(`/advisors/user/${usuario.id}`);
          if (perfilRes.ok) {
            const perfilData = await perfilRes.json();
            updateCurrentUser({ id_perfil: perfilData.id_perfil });
          }
        } catch {}
      }

      setLoginSuccess(true);
      redirectTimeoutRef.current = setTimeout(() => {
        navigation.navigate("DevMentor");
      }, 2500);

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo iniciar sesión");
    }

  };

  if (loginSuccess) {
    return (
      <ImageBackground
        source={backgroundSource}
        style={styles.background}
        resizeMode="cover"
        fadeDuration={0}
      >
        <View style={styles.overlay}>
          <View style={styles.formContainer}>
            <ActivityIndicator size="large" color="#1E5BE0" />
            <Text style={[styles.title, { marginTop: 16 }]}>Bienvenido</Text>
            <Text style={styles.registerText}>Cargando tu panel...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={backgroundSource}
      style={styles.background}
      resizeMode="cover"
      fadeDuration={0}
    >
      <View style={styles.overlay}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Bienvenido</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo"
            placeholderTextColor="#3B4B64"
            value={correo}
            onChangeText={setCorreo}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#3B4B64"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={iniciarSesion}
          >
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              No tienes una cuenta?{" "}
              <Text
                style={styles.registerLink}
                onPress={() => navigation.navigate("Register")}
              >
                Registrarse ahora
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}