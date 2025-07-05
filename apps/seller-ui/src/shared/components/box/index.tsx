"use client";

import styled from "styled-components";
import '../../../styles/root.css';

interface BoxProps {
    css?:React.CSSProperties
}

const Box = styled.div.attrs<BoxProps>((props)=>({
    style:props.css,
}))<BoxProps>`box-sizing:border-box; border-color: var(--border);`;

export default Box;

