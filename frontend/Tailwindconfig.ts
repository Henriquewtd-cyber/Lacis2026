import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './pages/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['Cormorant Garamond', 'Georgia', 'serif'],
                sans: ['Jost', 'system-ui', 'sans-serif'],
            },
            colors: {
                paper: '#f4f0e8',
                cream: '#ece6d9',
                sand: '#d6cdb8',
                warm: '#b8a990',
                terra: '#8a6e56',
                umber: '#5e4635',
                bark: '#3a2c22',
                ink: '#1c1610',
            },
            gridTemplateColumns: {
                lacis: 'var(--left-w, 180px) 1fr var(--right-w, 260px)',
                grid5: 'repeat(5, 1fr)',
            },
            gridTemplateRows: {
                grid4: 'repeat(4, 1fr)',
            },
        },
    },
    plugins: [],
}

export default config

