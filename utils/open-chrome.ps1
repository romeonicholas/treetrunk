Add-Type -AssemblyName System.Windows.Forms

$url = "http://localhost:4000"
$targetScreenIndex = 1
$userDataDir = "C:\scripts\kiosk-chrome-profile"

if (-not (Test-Path $userDataDir)) { New-Item -ItemType Directory -Path $userDataDir | Out-Null }

$screens = [System.Windows.Forms.Screen]::AllScreens
if ($targetScreenIndex -ge $screens.Length) { throw "Requested screen index $targetScreenIndex but only $($screens.Length) screen(s) detected." }
$screen = $screens[$targetScreenIndex]
$bounds = $screen.Bounds
$X = $bounds.X; $Y = $bounds.Y; $W = $bounds.Width; $H = $bounds.Height

$chromePaths = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe"
)
$chrome = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { throw "Chrome not found in Program Files." }

$chromeArgs = @(
  "--new-window",
  "--disable-features=TranslateUI",
  "--user-data-dir=""$userDataDir""",
  $url
) -join " "

$proc = Start-Process -FilePath $chrome -ArgumentList $chromeArgs -PassThru

$win32 = @"
using System;
using System.Runtime.InteropServices;

public static class Win32 {
  [DllImport("user32.dll")]
  public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

  [DllImport("user32.dll")]
  public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);

  public static readonly IntPtr HWND_TOP = new IntPtr(0);
  public const uint SWP_NOZORDER = 0x0004;
  public const uint SWP_NOACTIVATE = 0x0010;
  public const int SW_RESTORE = 9;
}
"@
Add-Type -TypeDefinition $win32

$timeout = [DateTime]::UtcNow.AddSeconds(20)
$chromeWindow = $null
while ([DateTime]::UtcNow -lt $timeout) {
  Start-Sleep -Milliseconds 200
  $candidates = Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 }
  if ($candidates) { $chromeWindow = $candidates | Select-Object -First 1; break }
}

if (-not $chromeWindow) { throw "Couldn't find a Chrome window within the timeout." }

[void][Win32]::ShowWindow($chromeWindow.MainWindowHandle, [Win32]::SW_RESTORE)
[void][Win32]::SetWindowPos($chromeWindow.MainWindowHandle, [Win32]::HWND_TOP, $X, $Y, $W, $H, 0)

[void][Win32]::SetForegroundWindow($chromeWindow.MainWindowHandle)

$ws = New-Object -ComObject WScript.Shell
$ws.AppActivate($chromeWindow.Id) | Out-Null
Start-Sleep -Milliseconds 200
$ws.SendKeys("{F11}")
