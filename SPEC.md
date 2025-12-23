# Obsidian Rsync Plugin Specification

## Overview

Obsidian용 rsync 동기화 플러그인. 로컬 Obsidian 볼트와 원격 서버 간 SSH를 통한 파일 동기화 기능을 제공한다.

## Features

### 1. 수동 동기화

- 리본 아이콘(sync)을 클릭하여 동기화 모달을 열 수 있다
- 모달에서 "Start sync" 버튼을 클릭하여 동기화를 시작한다
- 동기화 진행률을 프로그레스 바로 표시한다

### 2. 예약 동기화

- 설정된 간격(분 단위)으로 자동 동기화를 실행한다
- 간격이 0이면 예약 동기화를 비활성화한다
- 플러그인 언로드 시 예약된 동기화를 정리한다

### 3. 양방향 동기화

동기화 실행 시 Pull과 Push가 순차적으로 실행된다.

#### Pull 단계
- 원격에서 로컬로 동기화
- `pullPaths`에 지정된 경로만 가져온다

#### Push 단계
- 로컬에서 원격으로 동기화
- `pullPaths`에 지정된 경로는 제외한다 (자동으로 exclude 처리)

### 4. SSH 인증

다음 순서로 인증 방법을 결정한다:

1. **개인키 인증**: `privateKeyPath`가 설정된 경우
2. **비밀번호 인증**: `sshUsername`과 `sshPassword`가 설정된 경우 (sshpass 사용)
3. **기본 SSH**: 위 조건이 없는 경우 기본 SSH 연결

### 5. Dry Run 모드

- 실제 파일을 변경하지 않고 동기화 시뮬레이션을 실행한다
- rsync의 `--dry-run` 옵션을 사용한다

### 6. 제외 패턴

- 동기화에서 제외할 파일/디렉토리 패턴을 지정할 수 있다
- 쉼표로 구분하여 여러 패턴을 설정한다
- 예: `*.log, temp/*, *backup*`

### 7. 로그 파일

- 동기화 로그를 지정된 파일에 저장할 수 있다
- rsync의 `--log-file` 옵션을 사용한다

## Settings

| 설정 항목 | 타입 | 기본값 | 설명 |
|-----------|------|--------|------|
| rsyncBinaryPath | string | '' | rsync 바이너리 경로 |
| remoteIP | string | '' | 원격 서버 IP 주소 |
| sshPort | number | 22 | SSH 포트 번호 |
| sshUsername | string | '' | SSH 사용자명 |
| sshPassword | string | '' | SSH 비밀번호 |
| privateKeyPath | string | '' | SSH 개인키 파일 경로 |
| localDirPath | string | '' | 로컬 동기화 디렉토리 경로 |
| remoteDirPath | string | '' | 원격 동기화 디렉토리 경로 |
| pullPaths | string[] | [] | Pull 전용 경로 목록 (원격에서만 가져올 경로) |
| dryRun | boolean | false | Dry run 모드 활성화 |
| logFilePath | string | '' | 로그 파일 경로 |
| excludePatterns | string[] | [] | 제외 패턴 목록 |
| scheduleInterval | number | 0 | 예약 동기화 간격 (분), 0이면 비활성화 |

## Rsync Command

### 기본 옵션

- `-a`: 아카이브 모드 (권한, 타임스탬프 등 보존)
- `-v`: 자세한 출력
- `-z`: 압축 전송
- `--progress`: 진행률 표시
- `--stats`: 전송 통계 표시
- `--no-links`: 심볼릭 링크 제외
- `--delete`: 대상에서 소스에 없는 파일 삭제

### 명령어 형식

동기화 실행 시 Pull → Push 순서로 실행된다.

**1. Pull (원격 -> 로컬)**: pullPaths에 지정된 경로만 가져옴
```
rsync -avz --progress --stats --no-links --delete \
  -e "ssh -p <port> [-i <key>]" \
  --include='<pullPath1>' --include='<pullPath2>' --exclude='*' \
  <user>@<ip>:<remote>/ <local>/
```

**2. Push (로컬 -> 원격)**: pullPaths를 제외하고 전송
```
rsync -avz --progress --stats --no-links --delete \
  -e "ssh -p <port> [-i <key>]" \
  --exclude='<pullPath1>' --exclude='<pullPath2>' \
  <local>/ <user>@<ip>:<remote>/
```

## UI Components

### 1. RsyncModal

동기화 실행을 위한 모달 창

- 프로그레스 바: 동기화 진행률 표시 (Pull/Push 각각)
- Start sync 버튼: 양방향 동기화 시작 (Pull → Push 순서)
- 설정 토글 버튼: 설정 섹션 표시/숨김
- 설정 섹션: 모든 설정 항목 표시 (접이식)

### 2. RsyncPluginSettingTab

플러그인 설정 탭

- Obsidian 설정 화면에서 플러그인 설정을 관리한다
- 모든 설정 항목에 대한 입력 필드를 제공한다

## Dependencies

- Node.js `child_process.exec`: rsync 명령어 실행
- `sshpass`: 비밀번호 기반 SSH 인증 시 필요 (시스템에 설치 필요)

## Notifications

- 동기화 성공: "Rsync completed"
- 동기화 실패: "Rsync failed: <error message>"
