@echo off
title KnightShift Dev Server
set PATH=C:\Users\neha1\.gemini\antigravity\scratch\node_env\node-v20.17.0-win-x64;%PATH%
echo Starting KnightShift Local Development Server...
cd /d C:\Users\neha1\.gemini\antigravity\scratch\knightshift-website
npm run dev
