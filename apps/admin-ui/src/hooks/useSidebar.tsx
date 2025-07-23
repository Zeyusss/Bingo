import { useAtom } from 'jotai'
import { activeSideBarItem } from '../app/configs/constants'

const useSidebar = () => {
    const [activeSidebar,setActiveSidebar] = useAtom(activeSideBarItem);
  return {activeSidebar,setActiveSidebar}
}

export default useSidebar
