/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Superficies y capas tonales
        'surface': '#f6fafe',
        'surface-low': '#f0f4f8',
        'surface-high': '#e4e9ed',
        'surface-lowest': '#ffffff',
        
        // Colores de marca y acentos
        'primary': '#0040a1',
        'primary-container': '#0056d2',
        'on-surface': '#171c1f',
        
        // Bordes y sombras ("Ghost Border")
        'outline-variant': 'rgba(23, 28, 31, 0.15)',
        
        // Colores de estado
        'error-container': '#fee2e2', // Rojo muy suave
        'on-error': '#991b1b',
        'success-container': '#dcfce7', // Verde muy suave
        'on-success': '#166534',
      },
      boxShadow: {
        // "Cloud Shadow" para elevación natural
        'cloud': '0 12px 32px rgba(23, 28, 31, 0.06)',
      },
      fontFamily: {
        // Inter es la tipografía elegida para el rigor editorial
        sans: ['Inter', 'sans-serif'], 
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}