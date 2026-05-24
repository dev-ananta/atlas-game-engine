#pragma once

#include <string>
#include <iostream>

class Logger {
public:
    static void Info(const std::string& message) {
        std::cout << "[INFO] " << message << std::endl;
    }
    
    static void Warning(const std::string& message) {
        std::cout << "[WARNING] " << message << std::endl;
    }
    
    static void Error(const std::string& message) {
        std::cerr << "[ERROR] " << message << std::endl;
    }
    
    static void Debug(const std::string& message) {
        #ifdef _DEBUG
        std::cout << "[DEBUG] " << message << std::endl;
        #endif
    }
};