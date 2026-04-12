import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
    html, body, #root {
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: ${({ theme }) => theme.bgtotal};
        color: ${({ theme }) => theme.text};
        font-family: 'Inter', sans-serif;
        overscroll-behavior: none;
    }

    html {
        color-scheme: ${({ theme }) => (theme.body === "#202020" ? "dark" : "light")};
        scroll-behavior: smooth;
    }

    html, body {
        overscroll-behavior: none; /* Desactiva rebote visual */
    }


    body {
        overflow-x: hidden;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
    }

    * {
        box-sizing: border-box;
    }

    *:focus-visible {
        outline: 3px solid ${({ theme }) => theme.primary};
        outline-offset: 3px;
    }

    button,
    input,
    select,
    textarea {
        font: inherit;
    }

    // img {
    //     max-width: 100%;
    //     display: block;
    // }
`;
