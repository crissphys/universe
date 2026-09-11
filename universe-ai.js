/**
 * Universe to Study — Cliente Seguro de IA (UniverseAI)
 * Se comunica exclusivamente con el backend (/api/ai/study) sin exponer claves en el cliente.
 */

(function () {
  'use strict';

  var API_STUDY_ENDPOINT = '/api/ai/study';
  var API_EMBED_ENDPOINT = '/api/ai/embed';
  var AUTH_TOKEN_KEY = 'universe_auth_token';

  function getAuthToken() {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || '';
    } catch (_) {
      return '';
    }
  }

  function getAuthHeaders() {
    var headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    var token = getAuthToken();
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
  }

  async function postJson(endpoint, body, timeoutMs) {
    timeoutMs = timeoutMs || 32000;
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, timeoutMs);

    try {
      var response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      var data = null;
      try {
        data = await response.json();
      } catch (_) {
        throw new Error('Respuesta no válida del servidor.');
      }

      if (!response.ok) {
        var errorMsg = data && (data.message || data.error) ? (data.message || data.error) : ('Error del servidor (' + response.status + ')');
        var err = new Error(errorMsg);
        err.status = response.status;
        err.code = data && data.error ? data.error : 'server_error';
        throw err;
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('La consulta de IA tardó más del tiempo límite. Por favor reintenta.');
      }
      throw err;
    }
  }

  var UniverseAI = {
    /**
     * Genera una pregunta tipo examen UNI mediante el backend NVIDIA NIM.
     * @param {Object} params - { subject, diff, topic, material, mode }
     * @returns {Promise<Object>} Objeto de pregunta normalizado
     */
    generateQuestion: async function (params) {
      params = params || {};
      var payload = {
        subject: params.subject || 'Aritmética',
        diff: params.diff || 'medio',
        topic: params.topic || '',
        material: params.material || '',
        mode: params.mode || 'exam',
        qualityMode: params.qualityMode === 'verified' ? 'verified' : 'fast',
        format: 'json'
      };

      var res = await postJson(API_STUDY_ENDPOINT, payload, payload.qualityMode === 'verified' ? 120000 : 70000);
      if (res && res.data && res.data.enunciado) {
        res.data._universeVerification = res.verification || null;
        res.data._universeQualityMode = res.qualityMode || payload.qualityMode;
        return res.data;
      }
      if (res && res.message && res.message.content) {
        try {
          var clean = res.message.content.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
          var parsed = JSON.parse(clean);
          if (parsed && parsed.enunciado) return parsed;
        } catch (_) {}
      }
      throw new Error('UniverseAI no pudo estructurar la pregunta solicitada.');
    },

    /**
     * Realiza consultas al Asistente y Tutor Académico.
     * @param {Object} options - { query, messages, context, mode }
     * @returns {Promise<Object>}
     */
    askStudyAssistant: async function (options) {
      options = options || {};
      var payload = {
        query: options.query || '',
        messages: options.messages || [],
        mode: options.mode || 'study',
        qualityMode: options.qualityMode === 'verified' ? 'verified' : 'fast'
      };
      return await postJson(API_STUDY_ENDPOINT, payload, payload.qualityMode === 'verified' ? 120000 : 70000);
    },

    /**
     * Obtiene el vector de embeddings del texto (soporte preparado para búsqueda futura).
     * @param {string} text
     * @returns {Promise<Object>}
     */
    embedText: async function (text) {
      return await postJson(API_EMBED_ENDPOINT, { input: text }, 15000);
    },

    /**
     * Degradación explícita para solicitudes de audio en tiempo real.
     */
    requestLiveAudio: function () {
      return {
        supported: false,
        message: 'El procesamiento de audio en tiempo real requiere backend de streaming seguro. Utiliza el modo de estudio interactivo por texto para proteger tus credenciales.'
      };
    }
  };

  window.UniverseAI = UniverseAI;
})();
