# 게임 컨셉 기획서 만들기

게임 소개부터 개발 에피소드까지 정리하고 PDF·PPTX·Figma SVG로 저장할 수 있는
정적 웹사이트입니다.

## 주요 특징

- 설치와 회원가입 없이 사용
- 입력 내용과 이미지를 현재 브라우저에 자동 저장
- 7개 상위 항목(소개·특징·플레이·이미지·시장·팀·에피소드) 구성
- 필요한 항목만 선택 표시
- 실시간 A4 미리보기와 페이지 자동 분할
- 5가지 문서 레이아웃 / 여백·간격·제목 정렬 수동 편집
- 메인·플레이·UI 이미지 업로드와 아트 컨셉 작성
- PDF / 수정 가능한 PPTX / Figma SVG 저장

## 로컬 실행

`index.html`을 브라우저에서 열면 바로 사용할 수 있습니다.

## GitHub Pages 배포

이 폴더를 하나의 GitHub 저장소로 사용합니다.

1. GitHub에서 빈 저장소를 만듭니다.
2. 아래 명령의 주소를 새 저장소 주소로 바꿔 실행합니다.

```bash
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git add .
git commit -m "Set up game concept document builder"
git push -u origin main
```

3. GitHub Pages에서 `main` 브랜치 / root를 배포 소스로 설정합니다.

## 참고

작성 데이터는 서버로 전송되지 않으며, 브라우저 localStorage에만 저장됩니다.
