import React, { useRef, useEffect, useState } from "react";
import { View,Text,ScrollView,TouchableOpacity,FlatList,Dimensions,Image} from "react-native";
import { Card } from "react-native-paper";
import { styles } from "../Styles/DashboardStyle";
import { apiFetch } from "../config/api";

const { width } = Dimensions.get("window");

export default function Dashboard({ navigation }) {

  const languageImageMap = {
    "Python": require("../../assets/images/python.jpg"),
    "Java": require("../../assets/images/java.webp"),
    "C++": require("../../assets/images/c++.png"),
  };

  const materiasImageMap = {
    "Compiladores": require("../../assets/images/compiladores.jpg"),
    "Contabilidad y finanzas": require("../../assets/images/conta.jpg"),
    "Economía": require("../../assets/images/economia.webp"),
    "Interfaces humano-computadora": require("../../assets/images/interfaces.jpg"),
    "Modelos y metodologías de desarrollo de software": require("../../assets/images/modelos.jpg"),
    "Protocolos de enrutamiento": require("../../assets/images/protocolos.jpg"),
    "Taller de Desarrollo 4": require("../../assets/images/taller4.jpg"),
    "Inglés": require("../../assets/images/ingles6.jpg"),
    "Taller de elaboración del informe de investigación": require("../../assets/images/tesis9.webp"),
    "Administración de sistemas operativos": require("../../assets/images/SO8.jpg"),
    "Cómputo distribuido": require("../../assets/images/distribuido.webp"),
    "Graficación" : require("../../assets/images/graficacion.webp"),
    "Taller de investigación en las ciencias computacionales" : require("../../assets/images/computacionales8.jpg"),
    "Sistemas operativos": require("../../assets/images/SO8.jpg"),
    "Desarrollo de aplicaciones web y móviles": require("../../assets/images/movil.jpg"),
    "Conmutadores y redes inalámbricas" : require("../../assets/images/conmutadores.webp"),
    "Inteligencia artificial": require("../../assets/images/AI.jpg"),
    "Teoría matemática de la computación": require("../../assets/images/teoria5.jpg"),
    "Investigación de operaciones": require("../../assets/images/operaciones.jpg"),
    "Calidad en los procesos de desarrollo de software": require("../../assets/images/calidad.jpg"),
    "Traductores de bajo nivel": require("../../assets/images/traductores.jpg"),
    "Fundamentos de redes": require("../../assets/images/redes5.jpg"),
    "Tópicos avanzados de bases de datos": require("../../assets/images/baseDatos.webp"),
    "Taller de desarrollo 3": require("../../assets/images/taller3.webp"),
    "Ecuaciones diferenciales": require("../../assets/images/diferenciales.jpg"),
    "Probabilidad y estadística" : require("../../assets/images/estadistica.jpeg"),
    "Programación distribuida y en paralelo" : require("../../assets/images/paralelo.jpg"),
    "Estudio de las organizaciones" : require("../../assets/images/organizaciones.jpg"),
    "Arquitectura de computadoras" : require("../../assets/images/arqui.webp"),
    "Administración de bases de datos" : require("../../assets/images/DB.webp"),
    "Taller de desarrollo 2" : require("../../assets/images/taller3.webp"),
    "Cálculo integral" : require("../../assets/images/integral.jpg"),
    "Métodos numéricos" : require("../../assets/images/metodos.jpg"),
    "Programación avanzada" : require("../../assets/images/programacion.jpg"),
    "Sistemas digitales" : require("../../assets/images/digitales.jpg"),
    "Diseño de bases de datos" : require("../../assets/images/diseñoBD.jpg"),
    "Taller de desarrollo 1" : require("../../assets/images/taller1.webp"),
    "Cálculo diferencial" : require("../../assets/images/diferencial.jpg"),
    "Álgebra lineal" : require("../../assets/images/algebra.jpg"),
    "Programación orientada a objetos" : require("../../assets/images/objetos.png"),
    "Estructura de datos" : require("../../assets/images/estructura.jpg"),
    "Electricidad y electrónica" : require("../../assets/images/electricidad.jpg"),
    "Taller de metodología de la investigación" : require("../../assets/images/metodologia.jpg"),
    "Fundamentos de matemáticas" : require("../../assets/images/fundamentos.webp"),
    "Matemáticas discretas" : require("../../assets/images/discretas.jpg"),
    "Física" : require("../../assets/images/fisica.jpg"),
    "Metodología de la programación" : require("../../assets/images/programacion1.jpg"),
    "Programación estructurada" : require("../../assets/images/estructurada.jpg"),
    "Taller de competencias informacionales" : require("../../assets/images/competencias.gif"),    
  };

  const resolveMateriaImage = (nombre) => {
    if (!nombre) return defaultCardImage;

    const normalized = nombre.trim();
    return materiasImageMap[normalized] || defaultCardImage;
  };

  const defaultCardImage = require("../../assets/images/tutorias.jpg");

  const resolveImageSource = (imagen) => {
    if (!imagen || typeof imagen !== "string") return defaultCardImage;

    const normalized = imagen.trim();
    return languageImageMap[normalized] || defaultCardImage;
  };

  const carouselImages = [
    require("../../assets/images/tutorias.jpg"),
    require("../../assets/images/tutorias2.jpg"),
    require("../../assets/images/tutorias3.jpg")
  ];

  const [materias, setMaterias] = useState([]);
  const materias9 = materias.filter(m => m.semestre === 9);
  const materias8 = materias.filter(m => m.semestre === 8);
  const materias7 = materias.filter(m => m.semestre === 7);
  const materias6 = materias.filter(m => m.semestre === 6);
  const materias5 = materias.filter(m => m.semestre === 5);
  const materias4 = materias.filter(m => m.semestre === 4);
  const materias3 = materias.filter(m => m.semestre === 3);
  const materias2 = materias.filter(m => m.semestre === 2);
  const materias1 = materias.filter(m => m.semestre === 1);

  const [lenguajes, setLenguajes] = useState([]);

  useEffect(() => {
    apiFetch("/lenguajes")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.detail || "Error al obtener lenguajes");
        }

        return data;
      })
      .then((data) => {
        setLenguajes(Array.isArray(data) ? data : data.lenguajes || []);
      })
      .catch((error) => {
        console.error("Error al obtener lenguajes", error);
        setLenguajes([]);
      });
  }, []);

  useEffect(() => {
    apiFetch("/materias")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.detail || "Error al obtener materias");
        }

        return data;
      })
      .then((data) => {
        setMaterias(Array.isArray(data) ? data : data.materias || []);
      })
      .catch((error) => {
        console.error("Error al obtener materias", error);
        setMaterias([]);
      });
  }, []);

  const scrollRef = useRef(null);
  const currentIndex = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      currentIndex.current =
        (currentIndex.current + 1) % carouselImages.length;

      scrollRef.current?.scrollTo({
        x: width * currentIndex.current,
        animated: true
      });
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>

      <FlatList
        data={[]}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
          
            <View style={styles.carouselContainer}>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
              >
                {carouselImages.map((image, index) => (
                  <View key={index} style={styles.carouselItem}>
                    <Image
                      source={image}
                      style={styles.carouselImage}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.contentConteiner}>

            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.sectionTitle}>Lenguajes de programación</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 6, paddingRight: 20 }}
            >
              {lenguajes.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate("Asesores")}
                >
                  <Card style={styles.card}>
                    <Card.Cover 
                    source={resolveImageSource(m.nombre)} 
                    style={styles.image} 
                    />
                    <Card.Content>
                      <Text style={styles.subject} numberOfLines={1}>{m.nombre}</Text>
                      <Text style={styles.description}>{m.descripcion}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.sectionTitle}>Materias 9° semestre LIDTS</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 6, paddingRight: 20 }}
            >
              {materias9.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate("Asesores", {
                    nombreMateria: m.nombre
                  })}
                >
                  <Card style={styles.card}>
                    <Card.Cover 
                      source={resolveMateriaImage(m.nombre)} 
                      style={styles.image} 
                    />
                    <Card.Content>
                      <Text style={styles.subject} numberOfLines={1}>{m.nombre}</Text>
                      <Text style={styles.description} >{m.descripcion}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.sectionTitle}>Materias 8° semestre LIDTS</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 6, paddingRight: 20 }}
            >
              {materias8.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate("Asesores", {
                    nombreMateria: m.nombre
                  })}
                >
                  <Card style={styles.card}>
                    <Card.Cover 
                      source={resolveMateriaImage(m.nombre)} 
                      style={styles.image} 
                    />
                    <Card.Content>
                      <Text style={styles.subject} numberOfLines={1}>{m.nombre}</Text>
                      <Text style={styles.description}>{m.descripcion}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.sectionTitle}>Materias 7° semestre LIDTS</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 6, paddingRight: 20 }}
            >
              {materias7.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate("Asesores", {
                    nombreMateria: m.nombre
                  })}
                >
                  <Card style={styles.card}>
                    <Card.Cover 
                      source={resolveMateriaImage(m.nombre)} 
                      style={styles.image} 
                    />
                    <Card.Content>
                      <Text style={styles.subject} numberOfLines={1}>{m.nombre}</Text>
                      <Text style={styles.description}>{m.descripcion}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.sectionTitle}>Materias 6° semestre LIDTS</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 6, paddingRight: 20 }}
            >
              {materias6.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate("Asesores", {
                    nombreMateria: m.nombre
                  })}
                >
                  <Card style={styles.card}>
                    <Card.Cover 
                      source={resolveMateriaImage(m.nombre)} 
                      style={styles.image} 
                    />
                    <Card.Content>
                      <Text style={styles.subject} numberOfLines={1}>{m.nombre}</Text>
                      <Text style={styles.description}>{m.descripcion}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.sectionTitle}>Materias 5° semestre LIDTS</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 6, paddingRight: 20 }}
            >
              {materias5.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate("Asesores", {
                    nombreMateria: m.nombre
                  })}
                >
                  <Card style={styles.card}>
                    <Card.Cover 
                    source={resolveMateriaImage(m.nombre)} 
                    style={styles.image}  
                    />
                    <Card.Content>
                      <Text style={styles.subject} numberOfLines={1}>{m.nombre}</Text>
                      <Text style={styles.description}>{m.descripcion}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.sectionTitle}>Materias 4° semestre LIDTS</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 6, paddingRight: 20 }}
            >
              {materias4.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate("Asesores", {
                    nombreMateria: m.nombre
                  })}
                >
                  <Card style={styles.card}>
                    <Card.Cover 
                    source={resolveMateriaImage(m.nombre)} 
                    style={styles.image}  
                    />
                    <Card.Content>
                      <Text style={styles.subject} numberOfLines={1}>{m.nombre}</Text>
                      <Text style={styles.description}>{m.descripcion}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.sectionTitle}>Materias 3° semestre LIDTS</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 6, paddingRight: 20 }}
            >
              {materias3.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate("Asesores", {
                    nombreMateria: m.nombre
                  })}
                >
                  <Card style={styles.card}>
                    <Card.Cover 
                    source={resolveMateriaImage(m.nombre)} 
                    style={styles.image}  
                    />
                    <Card.Content>
                      <Text style={styles.subject} numberOfLines={1}>{m.nombre}</Text>
                      <Text style={styles.description}>{m.descripcion}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.sectionTitle}>Materias 2° semestre LIDTS</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 6, paddingRight: 20 }}
            >
              {materias2.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate("Asesores", {
                    nombreMateria: m.nombre
                  })}
                >
                  <Card style={styles.card}>
                    <Card.Cover 
                    source={resolveMateriaImage(m.nombre)} 
                    style={styles.image}  
                    />
                    <Card.Content>
                      <Text style={styles.subject} numberOfLines={1}>{m.nombre}</Text>
                      <Text style={styles.description}>{m.descripcion}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View style={styles.line} />
              <Text style={styles.sectionTitle}>Materias 1° semestre LIDTS</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 6, paddingRight: 20 }}
            >
              {materias1.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate("Asesores", {
                    nombreMateria: m.nombre
                  })}
                >
                  <Card style={styles.card}>
                    <Card.Cover 
                      source={resolveMateriaImage(m.nombre)} 
                      style={styles.image} 
                    />
                    <Card.Content>
                      <Text style={styles.subject}numberOfLines={1}>{m.nombre}</Text>
                      <Text style={styles.description}>{m.descripcion}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>

            </View>
          </>      
        }
      />

    </View>
  );
}