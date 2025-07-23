'use client';
import styled from 'styled-components';

export const SidebarWrapper = styled.div`
background-color: var(--background);
transition: transform 0.2s ease;
height: 100%;
position: fixed;
transform: translateX(-100%);
width: 16rem;
flex-shrink: 0;
z-index: 202;
overflow-y: auto;
border-right: 1px solid var(--border);
flex-direction: column;
padding-top: var(--sidebar-padding);
padding-bottom: var(--sidebar-padding);
padding-left: var(--sidebar-padding);
padding-right: var(--sidebar-padding);
border-radius: var(--sidebar-radius);

::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  margin-left: 0;
  display: flex;
  position: static;
  height: 100vh;
  transform: translateX(0);
}

${(props: any) => {
  return props.collapsed && `
    display: inherit;
    margin-left: 0;
    transform: translateX(0);
  `;
}} 
`;

// overlay component
export const Overlay = styled.div`
background-color: rgba(15, 23, 42, 0.3);
position: fixed;
top: 0;
right: 0;
bottom: 0;
left: 0;
z-index: 201;
transition: opacity 0.3s ease;
opacity: 0.8;

@media (min-width: 768px) {
  display: none;
  z-index: auto;
  opacity: 1;
}
`;

// header component
export const Header = styled.div`
display: flex;
gap: 2rem;
align-items: center;
padding-left: 0.5rem;
padding-right: 2.5rem;
`;

// body component
export const Body = styled.div`
display: flex;
flex-direction: column;
gap: 0.5rem;
`;

// footer component
export const Footer = styled.div`
display: flex;
align-items: center;
justify-content: center;
gap: 3rem;
padding-top: 4.5rem;
padding-bottom: 2rem;
padding-left: 2rem;
padding-right: 2rem;

@media (min-width: 768px) {
  padding-top: 0;
  padding-bottom: 0;
}
`;

export const Sidebar = {
    Wrapper: SidebarWrapper,
    Header,
    Body,
    Overlay,
    Footer,
};