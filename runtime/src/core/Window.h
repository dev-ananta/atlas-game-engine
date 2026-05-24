#pragma once

#include <string>

struct GLFWwindow;

class Window {
public:
    Window(const std::string& title, int width, int height);
    ~Window();
    
    bool ShouldClose() const;
    void SwapBuffers();
    bool IsKeyPressed(int key) const;
    
    int GetWidth() const { return m_Width; }
    int GetHeight() const { return m_Height; }
    GLFWwindow* GetNativeWindow() const { return m_Window; }
    
private:
    GLFWwindow* m_Window;
    int m_Width;
    int m_Height;
    std::string m_Title;
};