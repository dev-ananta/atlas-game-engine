cmake_minimum_required(VERSION 3.20)
project(GameEngineRuntime VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Output directories
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# Source files
file(GLOB_RECURSE SOURCES
    "src/*.cpp"
    "src/*.h"
)

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/libs/glfw/include
    ${CMAKE_CURRENT_SOURCE_DIR}/libs/glad/include
    ${CMAKE_CURRENT_SOURCE_DIR}/libs/lua/src
    ${CMAKE_CURRENT_SOURCE_DIR}/libs/bullet/src
    ${CMAKE_CURRENT_SOURCE_DIR}/libs/assimp/include
    ${CMAKE_CURRENT_SOURCE_DIR}/libs/stb
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

# GLFW
set(GLFW_BUILD_DOCS OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
add_subdirectory(libs/glfw)

# Lua
add_subdirectory(libs/lua)

# Bullet Physics
set(BUILD_BULLET2_DEMOS OFF CACHE BOOL "" FORCE)
set(BUILD_UNIT_TESTS OFF CACHE BOOL "" FORCE)
add_subdirectory(libs/bullet)

# Assimp
set(ASSIMP_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(ASSIMP_BUILD_ASSIMP_TOOLS OFF CACHE BOOL "" FORCE)
add_subdirectory(libs/assimp)

# GLAD (compile as part of project)
add_library(glad STATIC
    libs/glad/src/glad.c
)
target_include_directories(glad PUBLIC
    libs/glad/include
)

# Link libraries
target_link_libraries(${PROJECT_NAME}
    glfw
    glad
    lua_static
    BulletDynamics
    BulletCollision
    LinearMath
    assimp
)

# OpenGL
find_package(OpenGL REQUIRED)
target_link_libraries(${PROJECT_NAME} OpenGL::GL)

# Platform-specific libraries
if(WIN32)
    target_link_libraries(${PROJECT_NAME} winmm)
elseif(UNIX AND NOT APPLE)
    target_link_libraries(${PROJECT_NAME} dl pthread)
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