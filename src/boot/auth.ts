import { defineBoot } from '#q-app'
import { useAuthStore } from '@/stores/auth';


export default defineBoot(() => {
  const auth = useAuthStore();
  auth.restore();
})
