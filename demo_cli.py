import sys
from agent_engine import ConsequenceSandbox, SafeExecutionAgent

def main():
    sandbox = ConsequenceSandbox(company_domain="acme.com")
    agent = SafeExecutionAgent(sandbox=sandbox)

    print("\n=== GEMINI CONSEQUENCE PREDICTOR DEMO ===")
    print("Type your agent command (or 'exit' to quit).\n")

    while True:
        try:
            user_input = input("\nAgent Task > ")
            if user_input.strip().lower() in ["exit", "quit"]:
                break
            if not user_input.strip():
                continue

            print("\n[Stage 1: PROPOSE] Drafting action with Gemini...")
            draft = agent.draft_action(user_input)
            print(f"  Recipients: {draft.recipients}")
            print(f"  Subject:    {draft.subject}")
            print(f"  Body:       {draft.body[:90]}...")

            print("\n[Stage 2: SIMULATE] Running Gemini Consequence Prediction...")
            report = sandbox.simulate(draft)
            print(f"  Predicted Risk:   {report.risk_level.value} (Score: {report.score:.2f})")
            print(f"  Blast Radius:     {report.blast_radius}")
            print("  Predicted Fallout:")
            for item in report.predicted_outcomes:
                print(f"    * {item}")

            print("\n[Stage 3: COMMIT GATE]")
            if report.passed:
                receipt = agent._commit_real_side_effect(draft)
                print(f"  ✅ ACTION COMMITTED: {receipt}")
            else:
                print(f"  ❌ ACTION BLOCKED: Blast radius threshold exceeded. Real tool execution aborted.")

        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
