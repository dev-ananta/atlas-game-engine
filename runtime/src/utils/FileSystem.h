#pragma once

#include <string>
#include <vector>
#include <fstream>
#include <sstream>
#include <cstdint>

class FileSystem {
public:
    static std::vector<uint8_t> ReadBinaryFile(const std::string& filepath) {
        std::ifstream file(filepath, std::ios::binary | std::ios::ate);
        if (!file.is_open()) {
            return std::vector<uint8_t>();
        }

        std::streamsize size = file.tellg();
        file.seekg(0, std::ios::beg);

        std::vector<uint8_t> buffer(size);
        if (!file.read(reinterpret_cast<char*>(buffer.data()), size)) {
            return std::vector<uint8_t>();
        }

        return buffer;
    }

    static std::string ReadTextFile(const std::string& filepath) {
        std::ifstream file(filepath);
        if (!file.is_open()) {
            return "";
        }

        std::stringstream buffer;
        buffer << file.rdbuf();
        return buffer.str();
    }

    static bool FileExists(const std::string& filepath) {
        std::ifstream file(filepath);
        return file.good();
    }
};
