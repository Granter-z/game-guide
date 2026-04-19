/**
 * Railway 等：在构建前设置 BACKEND_API_BASE 或 VITE_API_BASE_URL，
 * 会写入 public/runtime-config.js，无需依赖 Vite 对变量的注入。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'public', 'runtime-config.js');

const url =
  process.env.BACKEND_API_BASE?.trim() ||
  process.env.VITE_API_BASE_URL?.trim() ||
  '';

if (!url) {
  console.log(
    'write-runtime-api: BACKEND_API_BASE / VITE_API_BASE_URL unset, leaving public/runtime-config.js unchanged'
  );
  process.exit(0);
}

const content = `/**
 * 由 scripts/write-runtime-api.mjs 在构建时根据环境变量生成，勿手工提交敏感信息到公开仓库。
 */
window.__GAME_GUIDE_API_BASE__ = ${JSON.stringify(url)};
`;

fs.writeFileSync(out, content, 'utf8');
console.log('write-runtime-api: wrote', out);
