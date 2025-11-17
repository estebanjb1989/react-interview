import styled from 'styled-components'

export const Wrapper = styled.div`
  min-height: 100vh;
  padding: 20px;
  background: ${({ theme }) => theme.background};
  transition: background 0.25s;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;

export const ModeButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  padding: 0;
  background: ${({ theme }) => theme.surface};
  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow:
    4px 4px 10px rgba(0, 0, 0, 0.15),
    -4px -4px 10px rgba(255, 255, 255, 0.4);
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px) scale(1.05);
  }

  &:active {
    transform: scale(0.97);
  }
`;

export const IconCircle = styled.div<{ dark: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;

  background: ${({ dark }) =>
    dark
      ? "linear-gradient(135deg, #111 0%, #333 100%)"
      : "linear-gradient(135deg, #fff 0%, #ddd 100%)"};
`;

export const FloatingSync = styled.div<{ pending: number }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  box-shadow: 0px 4px 14px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  opacity: ${({ pending }) => (pending > 0 ? 1 : 0.5)};
  transition: all 0.25s ease;
  user-select: none;

  &:hover {
    transform: scale(1.04);
  }
`;