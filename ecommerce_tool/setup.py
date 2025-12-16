from setuptools import setup, find_packages

setup(
    name="ecommerce-tool",
    version="1.0.0",
    description="Multi-platform E-commerce integration CLI tool",
    packages=find_packages(),
    install_requires=[
        "requests",
        "colorama",
        "python-dateutil",
    ],
    entry_points={
        "console_scripts": [
            "ecomtool=ecommerce_tool.main:run",  # CLI entry point
        ],
    },
    author="Sean_K",
    python_requires=">=3.8",
)
