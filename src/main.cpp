#include "AttackTables.h"
#include "TestPositions.h"

int main()
{
    AttackTables::Initialize();

    RunTACTests(6);

    return 0;
}