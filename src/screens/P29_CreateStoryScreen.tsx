import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IdentifierType, IdentificadorRelato, RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { crearRelato } from '../services/storyService';
import { listarCategoriasActivas } from '../services/categoryService';
import { CategoriaTipo, normalizeIdentifier } from '../services/normalize';
import { contieneLenguajeOfensivo } from '../services/lexiconFilter';
import {
  guardarBorradorRelato,
  listarBorradoresRelato,
  BorradorRelato,
} from '../services/storyDrafts';

type Props = NativeStackScreenProps<RootStackParamList, 'P29_CreateStory'>;

const IDENTIFIER_TYPES: IdentifierType[] = ['Alias', 'CBU', 'CUIT', 'Tel', 'Local'];

export const P29_CreateStoryScreen: React.FC<Props> = ({ route, navigation }) => {
  const { user } = useAuth();
  const uid = user?.uid ?? 'anonimo';

  const [categorias, setCategorias] = useState<CategoriaTipo[]>([]);
  const [categoriaDropdown, setCategoriaDropdown] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fueVictima, setFueVictima] = useState(false);
  const [modusOperandi, setModusOperandi] = useState('');
  const [senales, setSenales] = useState<string[]>([]);
  const [senalInput, setSenalInput] = useState('');
  const [identificadores, setIdentificadores] = useState<IdentificadorRelato[]>([]);
  const [idTipo, setIdTipo] = useState<IdentifierType>('Alias');
  const [idValor, setIdValor] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [fuente, setFuente] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(route.params?.draftId ?? null);

  useEffect(() => {
    listarCategoriasActivas().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    if (!draftId) return;
    listarBorradoresRelato().then((borradores) => {
      const b = borradores.find((x) => x.id === draftId);
      if (b) cargarBorrador(b);
    });
  }, [draftId]);

  const cargarBorrador = (b: BorradorRelato) => {
    setTitulo(b.titulo);
    setCategoria(b.categoria);
    setFueVictima(b.fueVictima);
    setModusOperandi(b.modusOperandi);
    setSenales(b.senalesDeAlerta);
    setIdentificadores(b.identificadores);
    setLinks(b.links);
    setFuente(b.fuente);
  };

  const hayLenguaje = contieneLenguajeOfensivo(`${titulo} ${modusOperandi}`);

  const agregarSenal = () => {
    if (!senalInput.trim()) return;
    setSenales((prev) => [...prev, senalInput.trim()]);
    setSenalInput('');
  };

  const agregarIdentificador = () => {
    if (!idValor.trim()) return;
    const valorNormalizado = normalizeIdentifier(idTipo, idValor);
    setIdentificadores((prev) => [
      ...prev,
      { tipo: idTipo, valor: idValor.trim(), valorNormalizado },
    ]);
    setIdValor('');
  };

  const agregarLink = () => {
    if (!linkInput.trim()) return;
    setLinks((prev) => [...prev, linkInput.trim()]);
    setLinkInput('');
  };

  const handleGuardarBorrador = async () => {
    const b = await guardarBorradorRelato({
      id: draftId ?? undefined,
      titulo,
      categoria,
      modusOperandi,
      senalesDeAlerta: senales,
      identificadores,
      links,
      fueVictima,
      fuente,
    });
    setDraftId(b.id);
    Alert.alert('Borrador guardado', 'Podés retomarlo desde Mis relatos.');
  };

  const handleEnviar = async () => {
    setEnviando(true);
    try {
      await crearRelato({
        titulo,
        categoria,
        modusOperandi,
        senalesDeAlerta: senales,
        identificadores,
        links,
        fueVictima,
        fuente,
        autorUid: uid,
      });
      setEnviando(false);
      Alert.alert(
        'Relato en revisión',
        'Gracias por compartir. Puede tardar hasta 24hs en publicarse.',
        [{ text: 'Aceptar', onPress: () => navigation.replace('P30_MyStories') }]
      );
    } catch (e: any) {
      setEnviando(false);
      Alert.alert('No se pudo enviar', e?.message ?? 'Revisá los campos e intentá de nuevo.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Contar una forma de estafar</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Falsa preventa de celulares por Instagram"
          placeholderTextColor="#94A3B8"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Categoría</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setCategoriaDropdown((v) => !v)}>
          <Text style={styles.dropdownText}>{categoria || 'Elegí una categoría'}</Text>
          <Ionicons name={categoriaDropdown ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" />
        </TouchableOpacity>
        {categoriaDropdown && (
          <View style={styles.dropdownOptions}>
            {categorias.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.optionRow}
                onPress={() => {
                  setCategoria(c.nombre);
                  setCategoriaDropdown(false);
                }}
              >
                <Ionicons name={(c.icono ?? 'pricetag-outline') as any} size={16} color={c.color ?? '#0F172A'} />
                <Text style={styles.optionText}>{c.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>¿Fuiste víctima?</Text>
        <View style={styles.segmented}>
          <TouchableOpacity
            style={[styles.segBtn, fueVictima && styles.segBtnActive]}
            onPress={() => setFueVictima(true)}
          >
            <Text style={[styles.segText, fueVictima && styles.segTextActive]}>Fui víctima</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, !fueVictima && styles.segBtnActive]}
            onPress={() => setFueVictima(false)}
          >
            <Text style={[styles.segText, !fueVictima && styles.segTextActive]}>Lo vi / me enteré</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>¿Cómo funciona la estafa?</Text>
        <TextInput
          style={styles.textArea}
          multiline
          textAlignVertical="top"
          placeholder="Explicá el paso a paso del engaño (mín. 20 caracteres)"
          placeholderTextColor="#94A3B8"
          value={modusOperandi}
          onChangeText={setModusOperandi}
        />

        {hayLenguaje && (
          <Text style={styles.warn}>Se filtrarán términos ofensivos al publicar.</Text>
        )}

        <Text style={styles.label}>Señales de alerta</Text>
        {senales.map((s, i) => (
          <View key={i} style={styles.tagRow}>
            <Text style={styles.tagText}>{s}</Text>
            <TouchableOpacity onPress={() => setSenales((p) => p.filter((_, j) => j !== i))}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput
            style={styles.inputFlex}
            placeholder="Ej: Piden seña antes de entregar"
            placeholderTextColor="#94A3B8"
            value={senalInput}
            onChangeText={setSenalInput}
            onSubmitEditing={agregarSenal}
          />
          <TouchableOpacity style={styles.addBtn} onPress={agregarSenal}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Identificadores vinculados (opcional)</Text>
        {identificadores.map((id, i) => (
          <View key={i} style={styles.tagRow}>
            <Text style={styles.tagText}>
              [{id.tipo}] {id.valor}
            </Text>
            <TouchableOpacity onPress={() => setIdentificadores((p) => p.filter((_, j) => j !== i))}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addRow}>
          <TouchableOpacity
            style={styles.tipoDropdown}
            onPress={() => setIdTipo(idTipo === 'Alias' ? 'CBU' : idTipo === 'CBU' ? 'CUIT' : idTipo === 'CUIT' ? 'Tel' : idTipo === 'Tel' ? 'Local' : 'Alias')}
          >
            <Text style={styles.tipoDropdownText}>{idTipo}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.inputFlex}
            placeholder="Valor del identificador"
            placeholderTextColor="#94A3B8"
            value={idValor}
            onChangeText={setIdValor}
            onSubmitEditing={agregarIdentificador}
          />
          <TouchableOpacity style={styles.addBtn} onPress={agregarIdentificador}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Enlaces (opcional)</Text>
        {links.map((l, i) => (
          <View key={i} style={styles.tagRow}>
            <Text style={styles.tagText} numberOfLines={1}>{l}</Text>
            <TouchableOpacity onPress={() => setLinks((p) => p.filter((_, j) => j !== i))}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput
            style={styles.inputFlex}
            placeholder="https://..."
            placeholderTextColor="#94A3B8"
            value={linkInput}
            onChangeText={setLinkInput}
            onSubmitEditing={agregarLink}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.addBtn} onPress={agregarLink}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Fuente (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: me lo contó un vecino, lo vi en un grupo"
          placeholderTextColor="#94A3B8"
          value={fuente}
          onChangeText={setFuente}
        />

        <TouchableOpacity style={styles.draftBtn} onPress={handleGuardarBorrador}>
          <Ionicons name="save-outline" size={16} color="#0F172A" />
          <Text style={styles.draftText}>Guardar borrador</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.submitBtn, enviando && styles.disabled]} onPress={handleEnviar} disabled={enviando}>
          {enviando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Enviar a revisión</Text>}
        </TouchableOpacity>
        <Text style={styles.note}>Tu relato quedará en revisión y puede tardar hasta 24hs en publicarse.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  navTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  content: { padding: 16, paddingBottom: 32 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  inputFlex: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 100,
  },
  warn: { fontSize: 11, color: '#92400E', marginTop: 4 },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
    marginTop: 4,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  optionText: { fontSize: 13, color: '#334155' },
  segmented: { flexDirection: 'row', gap: 8 },
  segBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  segBtnActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  segText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  segTextActive: { color: '#FFFFFF' },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  tagText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#334155' },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  addBtn: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  tipoDropdown: { width: 64, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  tipoDropdownText: { fontSize: 11, fontWeight: '700', color: '#0F172A' },
  draftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  draftText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  submitBtn: { backgroundColor: '#000000', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.5 },
  note: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 8 },
});
