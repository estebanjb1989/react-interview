import { useAppSelector } from "@/store/hooks";

import AppHeader from './AppHeader'

import {
  Wrapper,
  FloatingSync
} from './styled'

interface LayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: LayoutProps) {
  const queue = useAppSelector((state) => state.sync.queue);

  return (
    <Wrapper>
      <AppHeader />
      {children}
      {queue.length > 0 ?
        <FloatingSync pending={queue.length}>
          {queue.length} pending
        </FloatingSync> : null}
    </Wrapper>
  );
}
