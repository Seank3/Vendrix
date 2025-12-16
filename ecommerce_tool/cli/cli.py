# cli.py
class CLI:
    def __init__(self):
        pass
    
    def run_cli(self):
        """Basic CLI implementation"""
        print("=" * 50)
        print("E-Commerce Tool CLI")
        print("=" * 50)
        print("\nAvailable commands:")
        print("1. Process orders")
        print("2. Generate reports")
        print("3. Update inventory")
        print("4. Exit")
        
        while True:
            try:
                choice = input("\nEnter your choice (1-4): ")
                
                if choice == "1":
                    print("Processing orders...")
                    # Add order processing logic here
                elif choice == "2":
                    print("Generating reports...")
                    # Add report generation logic here
                elif choice == "3":
                    print("Updating inventory...")
                    # Add inventory update logic here
                elif choice == "4":
                    print("Goodbye!")
                    break
                else:
                    print("Invalid choice. Please enter 1-4.")
                    
            except KeyboardInterrupt:
                print("\n\nProgram interrupted. Goodbye!")
                break
            except Exception as e:
                print(f"Error: {e}")