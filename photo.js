import { getStorage, ref } from "firebase/storage";

const storage = getStorage();
const mountainRef = ref(storage, 'mountains.jpg');
const mountainsRef = ref(storage, )