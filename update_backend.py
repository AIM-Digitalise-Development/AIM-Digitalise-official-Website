import os
import stat

lead_path = r"C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\LeadController.php"
partner_path = r"C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\PartnerLeadController.php"

for p in [lead_path, partner_path]:
    if os.path.exists(p):
        try:
            os.chmod(p, stat.S_IWRITE | stat.S_IREAD)
        except Exception as e:
            print(f"chmod error on {p}: {e}")

with open(lead_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("'employee', 'partner', 'assignedTo'", "'employee', 'partner.parent', 'assignedTo'")
content = content.replace("'employee', 'partner', 'category'", "'employee', 'partner.parent', 'category'")

with open(lead_path, "w", encoding="utf-8") as f:
    f.write(content)

print("LeadController updated successfully via Python")

with open(partner_path, "r", encoding="utf-8") as f:
    pcontent = f.read()

pcontent = pcontent.replace("Lead::with(['demoSlot'", "Lead::with(['partner.parent', 'employee', 'demoSlot'")

with open(partner_path, "w", encoding="utf-8") as f:
    f.write(pcontent)

print("PartnerLeadController updated successfully via Python")
