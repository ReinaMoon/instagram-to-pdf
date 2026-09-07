# Instagram to PDF

[English](./README.md) | **한국어**

공개 인스타그램 게시물(사진 한 장 또는 여러 장 캐러셀)을 **PDF**나 **원본 해상도 이미지 폴더**로 만듭니다. 인스타 로그인, 앱, 브라우저 확장 프로그램은 필요 없습니다. 변환은 GitHub Actions에서 돌아갑니다.

전 세계용 공용 서버가 아닙니다. 쓰려면 이 저장소를 **포크**(또는 직접 클론)해서 **본인 GitHub 계정**에서 워크플로가 실행되게 하세요. 페이스북, 링크드인 링크는 지원하지 않습니다.

<p>
  <img alt="workflow" src="https://img.shields.io/badge/GitHub%20Actions-workflow__dispatch-2ea44f?logo=githubactions&logoColor=white">
  <img alt="node" src="https://img.shields.io/badge/node-20-339933?logo=node.js&logoColor=white">
  <img alt="playwright" src="https://img.shields.io/badge/playwright-chromium-2EAD33?logo=playwright&logoColor=white">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-blue">
</p>

## 왜 쓰나

인스타 캐러셀은 한 장씩만 보여서, 이미지 저장으로는 나머지를 놓치기 쉽습니다. 이 도구는 슬라이드를 차례로 넘겨 이미지를 받은 뒤 PDF 또는 JPG zip으로 묶습니다.

## 기능

- 사진 한 장 게시물과 **캐러셀**
- 결과물 두 가지: **PDF**(페이지당 이미지 한 장) 또는 **원본 JPG zip**
- 공개 게시물만. 인스타 API나 쿠키 없음
- GitHub Actions에서 돌아가서 폰과 PC는 브라우저만 있으면 됨
- 선택적으로 `index.html` 웹 UI로 링크만 붙여넣을 수 있음

## 폰이나 컴퓨터에서 쓰기

먼저 포크하세요. 다른 사람 저장소의 워크플로는 내 토큰으로 실행할 수 없습니다.

1. **Fork**를 누릅니다 (포크는 **Public**으로 두면 GitHub Pages와 Actions가 무료입니다)
2. 포크한 저장소: **Settings → Actions → General**에서 Actions 허용 후 Save
3. 포크한 저장소: **Settings → Pages** → Source를 **Deploy from a branch** → branch `main`, folder `/ (root)` → Save
4. `index.html`에서 `OWNER`와 `REPO`를 *본인* 깃허브 아이디와 포크 저장소 이름으로 바꿉니다
5. 1분 정도 기다린 뒤 폰이나 PC에서 `https://<아이디>.github.io/<저장소이름>/` 을 엽니다

처음에는 **GitHub personal access token**이 필요합니다 (이 저장소만, Actions: Read and write). 토큰은 그 브라우저 local storage에만 저장되고 `api.github.com`으로만 전송됩니다.

그다음 인스타 게시물 URL(`instagram.com/p/...` 또는 `/reel/...`)을 넣고 이미지 또는 PDF를 고르면 됩니다. 한 번 실행에 약 1-2분 걸립니다.

### 웹페이지 없이 쓰기

1. 포크한 저장소에서 **Actions → Instagram to PDF → Run workflow**
2. `post_url`에 게시물 링크를 넣습니다
3. 초록 체크가 나오면 **Artifacts**에서 `instagram-pdf` 또는 `instagram-images`를 받습니다

GitHub 앱이나 모바일 브라우저에서도 같습니다.

## 제한

- **공개 인스타 게시물만.** 비공개 계정은 로그아웃 상태에서는 읽을 수 없습니다.
- **사진만.** 영상이 섞여 있으면 썸네일/포스터 프레임만 저장됩니다.
- 인스타 HTML은 자주 바뀝니다. 이미지를 못 찾으면 그 부분을 먼저 보면 됩니다.
- 링크 하나씩 처리합니다. 계정 감시 기능은 없습니다.
- 페이스북, 링크드인 등 다른 사이트는 안 됩니다.

## 동작 방식

인스타 캐러셀은 DOM에 슬라이드를 조금만 남겨 둡니다. 스크립트는:

1. Playwright(헤드리스 Chromium)로 게시물을 엽니다
2. 쿠키/가입 팝업을 닫습니다
3. 화면에 보이는 슬라이드를 고르고 Next를 반복합니다 (파일명으로 중복 제거)
4. 이미지를 원본 해상도로 받습니다
5. Playwright `page.pdf()`로 PDF를 만듭니다
6. PDF와 이미지를 워크플로 artifact로 올립니다

구현은 [`scripts/instagram-to-pdf.mjs`](./scripts/instagram-to-pdf.mjs), 워크플로는 [`.github/workflows/instagram-to-pdf.yml`](./.github/workflows/instagram-to-pdf.yml)입니다.

## 기여

이슈와 PR을 환영합니다. 인스타 마크업이 바뀌어 깨진 경우를 특히 기다립니다. 실패한 게시물 URL이나 게시물 종류를 적어 주세요.

## 라이선스

[MIT](./LICENSE)
