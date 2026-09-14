import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import LibraryPage from "@/pages/LibraryPage";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import SearchPage from "@/pages/SearchPage";
import BookDetailPage from "@/pages/BookDetailPage";
import { useTheme } from "./hooks/useTheme";

function App() {
  useTheme();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/library" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route element={<AuthGuard />}>
        <Route element={<AppLayout />}>
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/library" replace />} />
    </Routes>
  );
}

export default App;
