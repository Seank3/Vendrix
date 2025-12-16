import logging
from cli.interface import CLI

def run():
    """Entry point for the pip-installed CLI"""
    cli_app = CLI()
    cli_app.run_cli()

if __name__ == "__main__":
    run()
