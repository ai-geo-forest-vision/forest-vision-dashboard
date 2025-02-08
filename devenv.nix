{pkgs, ...}: {
  packages = with pkgs; [
    virtualenv
    pyright
    black
    isort
  ];

  languages.python.enable = true;
}
