// 1️⃣ IMPORTS - Clean and ordered
import "@/styles/globals.css";

import { AppProviders } from "@/app/providers/AppProviders";
import { AppRouter } from "./router";

// 2️⃣ TYPE DEFINITIONS - None needed

// 3️⃣ COMPONENT DECLARATION
const App = () => {
  // 4️⃣ STATE (useState) - None needed

  // 5️⃣ REFS (useRef) - None needed

  // 6️⃣ DERIVED VALUES - None needed

  // 7️⃣ CUSTOM HOOKS - None needed

  // 8️⃣ EFFECTS (useEffect) - None needed

  // 9️⃣ HANDLER FUNCTIONS - None needed

  // 🔟 CONDITIONAL LOGIC - None needed

  // 1️⃣1️⃣ JSX RETURN - Pure UI representation
  return (
    <AppProviders>
      {/* All pages now have access to Auth & Customer Context */}
      <AppRouter />
    </AppProviders>
  );
};

// 1️⃣2️⃣ EXPORT
export default App;
