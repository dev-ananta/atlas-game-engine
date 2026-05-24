#include "core/Application.h"
#include <iostream>
#include <cstring>

int main(int argc, char** argv) {
    std::string gameFilePath;
    
    // Parse command line arguments
    if (argc > 1) {
        gameFilePath = argv[1];
    } else {
        std::cout << "GameEngine Runtime v1.0.0\n";
        std::cout << "Usage: " << argv[0] << " <path-to-game-file>\n";
        std::cout << "\nPlease drag and drop a .game file or provide the path as an argument.\n";
        
        #ifdef _WIN32
        std::cout << "\nPress Enter to exit...";
        std::cin.get();
        #endif
        
        return 1;
    }
    
    try {
        // Create and run application
        Application app(gameFilePath);
        app.Run();
    } catch (const std::exception& e) {
        std::cerr << "Fatal Error: " << e.what() << std::endl;
        
        #ifdef _WIN32
        std::cout << "\nPress Enter to exit...";
        std::cin.get();
        #endif
        
        return 1;
    }
    
    return 0;
}