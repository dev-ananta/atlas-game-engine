cmake_minimum_required(VERSION 3.20)
project(GameEngineRuntime VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Output directories
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# Source files. The checked-in runtime is intentionally dependency-free so CI
# can validate packaged games without requiring vendored graphics libraries.
set(SOURCES
    src/main.cpp
    src/core/Application.cpp
    src/core/Application.h
    src/core/GameLoader.cpp
    src/core/GameLoader.h
    src/utils/FileSystem.h
    src/utils/Logger.h
)

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# Platform-specific settings
if(WIN32)
    target_compile_definitions(${PROJECT_NAME} PRIVATE 
        PLATFORM_WINDOWS
        _CRT_SECURE_NO_WARNINGS
    )
    set_target_properties(${PROJECT_NAME} PROPERTIES
        OUTPUT_NAME "runtime-windows"
        WIN32_EXECUTABLE FALSE
    )
elseif(APPLE)
    target_compile_definitions(${PROJECT_NAME} PRIVATE PLATFORM_MACOS)
    set_target_properties(${PROJECT_NAME} PROPERTIES
        OUTPUT_NAME "runtime-macos"
        MACOSX_BUNDLE FALSE
    )
elseif(UNIX)
    target_compile_definitions(${PROJECT_NAME} PRIVATE PLATFORM_LINUX)
    set_target_properties(${PROJECT_NAME} PROPERTIES
        OUTPUT_NAME "runtime-linux"
    )
endif()

# Copy shaders and assets to output
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_CURRENT_SOURCE_DIR}/shaders
    $<TARGET_FILE_DIR:${PROJECT_NAME}>/shaders
)

# Installation
install(TARGETS ${PROJECT_NAME}
    RUNTIME DESTINATION bin
    BUNDLE DESTINATION .
)

install(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/shaders
    DESTINATION bin
)
